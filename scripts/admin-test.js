(async () => {
  try {
    const base = 'http://localhost:3001/api';
    const loginRes = await fetch(`${base}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vms.com', password: 'admin123' })
    });
    const loginBody = await loginRes.json();
    console.log('LOGIN:', loginRes.status, loginBody);
    if (!loginRes.ok) return;
    const token = loginBody.accessToken;

    // Create product
    const createRes = await fetch(`${base}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Script Product', price: 19.99, oldPrice: 29.99, category: 'Scripts', image: '/img.png', rating: 4, reviews: 0, instock: true, description: 'From script' })
    });
    const created = await createRes.json();
    console.log('CREATE:', createRes.status, created);
    if (!createRes.ok) return;
    const id = created.id;

    // Update
    const updateRes = await fetch(`${base}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Script Product Updated', price: 17.99 })
    });
    console.log('UPDATE:', updateRes.status, await updateRes.json());

    // Delete
    const delRes = await fetch(`${base}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('DELETE:', delRes.status, await delRes.text());

    // Orders
    const ordersRes = await fetch(`${base}/orders`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('ORDERS:', ordersRes.status, await ordersRes.json());

  } catch (e) {
    console.error(e);
  }
})();
