# 🛒 Atualização Necessária no Checkout

## ⚠️ Mudanças a Fazer no Arquivo `src/pages/Checkout.tsx`

### 1. Adicionar Imports no Início do Arquivo

```typescript
// Adicionar estas linhas após os imports existentes (linha 10)
import { createOrder } from "@/lib/orders";
import { createPayment } from "@/lib/payments";
```

### 2. Substituir a Função `handleMercadoPagoPayment`

Localizar a função `handleMercadoPagoPayment` (por volta da linha 164) e substituir por:

```typescript
const handleMercadoPagoPayment = async () => {
  setIsProcessingPayment(true);
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Você precisa estar logado para finalizar a compra');
      setIsProcessingPayment(false);
      return;
    }

    // 1. Criar pedido no Supabase PRIMEIRO
    const orderData = {
      user_id: session.user.id,
      items: items.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image,
        quantity: i.quantity,
        unit_price: i.product.price,
        total_price: i.product.price * i.quantity,
      })),
      subtotal: subtotal,
      shipping_cost: selectedShipping.price,
      discount: 0,
      total: subtotal + selectedShipping.price,
      recipient_name: `${form.name} ${form.surname}`,
      recipient_phone: form.whatsapp,
      recipient_email: form.email,
      shipping_address: {
        street: form.street,
        number: form.number || "S/N",
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        cep: form.cep,
      },
      shipping_method: `${selectedShipping.company} - ${selectedShipping.name}`,
      shipping_days: selectedShipping.delivery_time,
      is_gift: form.isGift,
      gift_message: form.isGift ? `Para: ${form.recipientName}` : undefined,
    };

    const { order, error: orderError } = await createOrder(orderData);

    if (orderError || !order) {
      toast.error('Erro ao criar pedido. Tente novamente.');
      console.error('Erro ao criar pedido:', orderError);
      setIsProcessingPayment(false);
      return;
    }

    toast.success(`Pedido ${order.order_number} criado!`);

    // 2. Criar preferência de pagamento no Mercado Pago
    const orderPayload = {
      customer: {
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp
      },
      address: {
        street: form.street,
        number: form.number || "SN",
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        cep: form.cep
      },
      shipping: {
        company: selectedShipping.company,
        method: selectedShipping.name,
        price: selectedShipping.price,
        days: selectedShipping.delivery_time
      },
      payment_method: paymentMethod === 'mp' ? 'credit_card' : paymentMethod,
      items: items.map(i => ({
        product_name: i.product.name,
        product_description: i.product.description,
        product_image: i.product.image,
        quantity: i.quantity,
        unit_price: i.product.price
      })),
      observations: "",
      // Adicionar order_id para vincular ao Supabase
      order_id: order.id,
      order_number: order.order_number,
    };

    const result = await createOrderAndPreference(orderPayload);

    // 3. Criar registro de pagamento no Supabase
    await createPayment({
      order_id: order.id,
      payment_method: paymentMethod,
      amount: subtotal + selectedShipping.price,
      external_preference_id: result.preference_id,
      payer_email: form.email,
      payer_name: `${form.name} ${form.surname}`,
    });

    // 4. Redirecionar para pagamento
    if (result.init_point) {
      toast.success("Redirecionando para o pagamento seguro...");
      clearCart(); // Limpar carrinho ANTES de redirecionar
      window.location.href = result.init_point;
    } else {
      toast.success("Pedido criado! Aguardando pagamento.");
      clearCart();
      navigate(`/payment/pending?order_id=${order.id}`);
    }
  } catch (err) {
    console.error('Erro no checkout:', err);
    toast.error("Erro ao processar pagamento. Tente novamente.");
  } finally {
    setIsProcessingPayment(false);
  }
};
```

## 📝 Explicação das Mudanças

1. **Verifica Autenticação**: Garante que o usuário está logado antes de criar o pedido
2. **Cria Pedido no Supabase**: Salva o pedido com todos os detalhes no banco de dados
3. **Cria Preferência no Mercado Pago**: Gera o link de pagamento
4. **Registra Pagamento**: Cria registro de pagamento vinculado ao pedido
5. **Redireciona**: Envia o usuário para o Mercado Pago ou página de confirmação
6. **Limpa Carrinho**: Remove itens do carrinho após sucesso

## ✅ Benefícios

- ✅ Pedidos salvos no banco de dados
- ✅ Cliente pode ver pedidos no perfil (`/profile`)
- ✅ Admin pode gerenciar pedidos
- ✅ Histórico completo de pagamentos
- ✅ Chat vinculado aos pedidos
- ✅ Rastreamento de status

## 🔄 Próximos Passos

Após fazer essa mudança:

1. Executar o schema SQL no Supabase (ver `SUPABASE-SETUP.md`)
2. Testar o checkout com um produto
3. Verificar se o pedido aparece em `/profile`
4. Verificar se o pedido aparece no admin

---

**💡 IMPORTANTE**: Certifique-se de que o schema SQL foi executado no Supabase ANTES de testar o checkout!
