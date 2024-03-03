const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DATA_FILE = './data/items.json';

// Utility function to reorder items
const reorderItem = (items, id, direction) =>
{
  const index = items.findIndex(item => item.id === parseInt(id, 10));
  if (index === -1) return false; // Item not found

  if (direction === 'up' && index > 0)
  {
    // Swap with the previous item
    [ items[ index ], items[ index - 1 ] ] = [ items[ index - 1 ], items[ index ] ];
    return true;
  } else if (direction === 'down' && index < items.length - 1)
  {
    // Swap with the next item
    [ items[ index ], items[ index + 1 ] ] = [ items[ index + 1 ], items[ index ] ];
    return true;
  }

  // No reordering happened (first item asked to move up or last item asked to move down)
  return false;
};

// Function to read the data file safely
const readDataFile = () =>
{
  try
  {
    if (fs.existsSync(DATA_FILE) && fs.statSync(DATA_FILE).size > 0)
    {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(fileContent);
    } else
    {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
      return [];
    }
  } catch (error)
  {
    console.error('Error reading from data file:', error);
    return [];
  }
};

// Ensure data file exists and is properly initialized
const initializeDataFile = () =>
{
  if (!fs.existsSync(DATA_FILE) || fs.statSync(DATA_FILE).size === 0)
  {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
  }
};

initializeDataFile();

// Route to get all items
app.get('/items', (req, res) =>
{
  const items = readDataFile();
  res.json(items);
});

// Route to add a new item
app.post('/items', (req, res) =>
{
  const items = readDataFile();
  const newItem = { id: items.length + 1, name: req.body.name, progress: 0 };
  items.push(newItem);
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  res.json(newItem);
});

// Route to update an item's progress
app.post('/items/update', (req, res) =>
{
  let items = readDataFile();
  const { id, change } = req.body;
  items = items.map(item =>
  {
    if (item.id === id)
    {
      item.progress = Math.max(0, Math.min(100, item.progress + change));
    }
    return item;
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  res.json({ success: true });
});

// Route to delete an item
app.delete('/items/:id', (req, res) =>
{
  const { id } = req.params;
  let items = readDataFile();
  items = items.filter(item => item.id !== parseInt(id, 10));
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  res.json({ success: true });
});

// Route to reorder an item
app.post('/items/reorder', (req, res) =>
{
  const { id, direction } = req.body; // Expecting 'up' or 'down' as direction
  let items = readDataFile();

  if (reorderItem(items, id, direction))
  {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    res.json({ success: true });
  } else
  {
    res.status(400).json({ success: false, message: "Item cannot be moved in the requested direction." });
  }
});

// Listen
app.listen(PORT, () =>
{
  console.log(`Server running on http://localhost:${PORT}`);
});

