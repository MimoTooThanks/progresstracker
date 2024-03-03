document.addEventListener('DOMContentLoaded', () =>
{
    const addItemForm = document.getElementById('addItemForm');
    const itemNameInput = document.getElementById('itemName');
    const itemsList = document.getElementById('itemsList');

    // Load existing items
    fetchItems();

    addItemForm.addEventListener('submit', function (e)
    {
        e.preventDefault();
        const itemName = itemNameInput.value.trim();
        if (itemName)
        {
            addItem(itemName);
            itemNameInput.value = '';
        }
    });

    function fetchItems()
    {
        fetch('http://localhost:3000/items')
            .then(response => response.json())
            .then(data =>
            {
                itemsList.innerHTML = '';
                data.forEach(item =>
                {
                    addItemToDOM(item);
                });
            })
            .catch(error => console.error('Error fetching items:', error));
    }

    function addItem(itemName)
    {
        fetch('http://localhost:3000/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: itemName }),
        })
            .then(response => response.json())
            .then(item =>
            {
                addItemToDOM(item);
            })
            .catch(error => console.error('Error adding item:', error));
    }

    function updateItem(id, change)
    {
        fetch('http://localhost:3000/items/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, change }),
        })
            .then(() =>
            {
                fetchItems();
            })
            .catch(error => console.error('Error updating item:', error));
    }

    function removeItem(id)
    {
        fetch(`http://localhost:3000/items/${id}`, {
            method: 'DELETE',
        })
            .then(() =>
            {
                fetchItems();
            })
            .catch(error => console.error('Error removing item:', error));
    }

    function reorderItem(id, direction)
    {
        fetch('http://localhost:3000/items/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, direction }),
        })
            .then(() =>
            {
                fetchItems();
            })
            .catch(error => console.error('Error reordering item:', error));
    }

    function addItemToDOM(item)
    {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div class="item-header">
                <h2>${item.name}</h2>
                <button onclick="reorderItem(${item.id}, 'up')">Move Up</button>
                <button onclick="reorderItem(${item.id}, 'down')">Move Down</button>
                <button onclick="removeItem(${item.id})">Remove</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${item.progress}%"></div>
            </div>
            <div class="controls">
                <button class="button-less" onclick="updateItem(${item.id}, -10)">-10%</button>
                <button class="button-less" onclick="updateItem(${item.id}, -1)">-1%</button>
                <button class="button-more" onclick="updateItem(${item.id}, 1)">+1%</button>
                <button class="button-more" onclick="updateItem(${item.id}, 10)">+10%</button>
            </div>
        `;
        itemsList.appendChild(div);
    }

    // Expose functions to the global scope
    window.updateItem = updateItem;
    window.reorderItem = reorderItem;
    window.removeItem = removeItem;
});
