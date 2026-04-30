// supabase/functions/validate-order/index.ts
// Deploy with: supabase functions deploy validate-order
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItemInput {
  id: string
  quantity: number
  selectedVariants: Record<string, string>
}

interface OrderInput {
  customer_name: string
  phone: string
  email: string
  city: string
  address: string
  country: string
  cart_items: CartItemInput[]
  delivery_method: string
  notes?: string
}

const SHIPPING_RATES: Record<string, number> = {
  'Standard Delivery': 5,
  'Express Delivery':  15,
  'Free Shipping':     0,
}

function sanitize(val: unknown): string {
  if (typeof val !== 'string') return ''
  return val.replace(/<[^>]*>?/gm, '').trim().slice(0, 500)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405)

  try {
    // Service role key bypasses RLS — safe because this runs server-side only
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body: OrderInput = await req.json()
    const { cart_items, delivery_method, ...customer } = body

    // ── Basic validation ────────────────────────────────────
    if (!cart_items?.length)    return json({ error: 'Cart is empty' }, 400)
    if (cart_items.length > 50) return json({ error: 'Too many items' }, 400)

    const required = ['customer_name', 'phone', 'email', 'city', 'address'] as const
    for (const field of required) {
      if (!customer[field]?.trim()) return json({ error: `${field} is required` }, 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return json({ error: 'Invalid email' }, 400)

    if (!/^\+?[\d\s\-]{7,15}$/.test(customer.phone))
      return json({ error: 'Invalid phone number' }, 400)

    // ── Fetch real prices from DB — client price is IGNORED ─
    const productIds = [...new Set(cart_items.map(i => i.id))]
    const { data: dbProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price, active, stock')
      .in('id', productIds)

    if (fetchError) throw fetchError

    const productMap = new Map(dbProducts?.map(p => [p.id, p]))

    // ── Validate every line item ────────────────────────────
    for (const item of cart_items) {
      const product = productMap.get(item.id)
      if (!product)          return json({ error: `Product not found: ${item.id}` }, 400)
      if (!product.active)   return json({ error: `"${product.name}" is no longer available` }, 400)
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)
        return json({ error: `Invalid quantity for "${product.name}"` }, 400)
    }

    // ── Server-side total calculation ───────────────────────
    const shippingFee = SHIPPING_RATES[delivery_method] ?? 5
    const subtotal = cart_items.reduce((sum, item) =>
      sum + productMap.get(item.id)!.price * item.quantity, 0)
    const totalPrice = Number((subtotal + shippingFee).toFixed(2))

    const validatedItems = cart_items.map(item => {
      const p = productMap.get(item.id)!
      return {
        id:               item.id,
        name:             p.name,
        price:            p.price,      // authoritative DB price
        quantity:         item.quantity,
        selectedVariants: item.selectedVariants,
      }
    })

    // ── Insert order ────────────────────────────────────────
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([{
        customer_name:   sanitize(customer.customer_name),
        phone:           sanitize(customer.phone),
        email:           sanitize(customer.email),
        city:            sanitize(customer.city),
        address:         sanitize(customer.address),
        country:         sanitize(customer.country ?? 'PH'),
        notes:           sanitize(customer.notes ?? ''),
        cart_items:      validatedItems,
        delivery_method: sanitize(delivery_method),
        payment_method:  'COD',
        subtotal,
        shipping_fee:    shippingFee,
        total_price:     totalPrice,
        status:          'pending',
      }])
      .select('id')
      .single()

    if (insertError) throw insertError

    return json({ success: true, orderId: order.id, total: totalPrice })

  } catch (err) {
    console.error('[validate-order]', err)
    return json({ error: 'Order could not be processed. Please try again.' }, 500)
  }
})
