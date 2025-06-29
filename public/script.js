function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded shadow z-50 ${
    isError ? 'bg-red-500' : 'bg-green-500'
  }`;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

let editMode = false;
let productIdToEdit = null;

function loadProducts() {
  showLoader();
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('products-list');
      list.innerHTML = '';
      data.forEach(p => {
        const li = document.createElement('li');
        li.className = 'p-2 flex justify-between items-center';
        li.innerHTML = `
          <div><strong>${p.name}</strong> - ${p.description} - $${p.price}</div>
          <div>
            <a href="#" class="text-blue-600 mr-2" onclick="startEditProduct('${p._id}', '${p.name}', '${p.description}', ${p.price})">Edit</a>
            <a href="#" class="text-red-600" onclick="openDeleteModal('${p._id}')">Delete</a>
          </div>
        `;
        list.appendChild(li);
      });
    })
    .catch(() => showToast('Failed to load products.', true))
    .finally(() => hideLoader());
}

document.getElementById('product-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const price = parseFloat(document.getElementById('price').value);

  if (!name || name.length < 2) {
    showToast('Name must be at least 2 characters.', true);
    return;
  }
  if (description.length > 200) {
    showToast('Description must be under 200 characters.', true);
    return;
  }
  if (isNaN(price) || price <= 0) {
    showToast('Price must be positive.', true);
    return;
  }

  showLoader();

  if (editMode && productIdToEdit) {
    fetch(`/api/products/${productIdToEdit}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    })
      .then(() => {
        showToast('Product updated!');
        this.reset();
        editMode = false;
        productIdToEdit = null;
        document.getElementById('submit-btn').textContent = 'Add Product';
        loadProducts();
      })
      .catch(() => showToast('Error updating product.', true))
      .finally(() => hideLoader());
  } else {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    })
      .then(() => {
        showToast('Product added!');
        this.reset();
        loadProducts();
      })
      .catch(() => showToast('Error adding product.', true))
      .finally(() => hideLoader());
  }
});

function startEditProduct(id, name, description, price) {
  document.getElementById('name').value = name;
  document.getElementById('description').value = description;
  document.getElementById('price').value = price;
  editMode = true;
  productIdToEdit = id;
  document.getElementById('submit-btn').textContent = 'Update Product';
}

let productIdToDelete = null;

function openDeleteModal(id) {
  productIdToDelete = id;
  document.getElementById('delete-modal').classList.remove('hidden');
}

document.getElementById('confirm-delete').onclick = function () {
  showLoader();
  fetch(`/api/products/${productIdToDelete}`, { method: 'DELETE' })
    .then(() => {
      showToast('Product deleted!');
      loadProducts();
      document.getElementById('delete-modal').classList.add('hidden');
    })
    .catch(() => showToast('Delete failed.', true))
    .finally(() => hideLoader());
};

document.getElementById('cancel-delete').onclick = function () {
  productIdToDelete = null;
  document.getElementById('delete-modal').classList.add('hidden');
};

loadProducts();

