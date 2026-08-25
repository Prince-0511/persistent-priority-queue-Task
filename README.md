# Persistent Priority Queue Task

A persistent priority queue implemented in JavaScript using Node.js.

The queue supports:

- insert
- extract_min
- extract_max
- peek
- update
- delete
- is_empty

## Implementation

The implementation uses two indexed binary heaps:

- Min heap for retrieving the item with the smallest priority.
- Max heap for retrieving the item with the largest priority.

A Map is used to store the actual items by ID.

The queue state is persisted to a JSON file after every mutating operation. When a new instance of the queue is created, the data is loaded from the file and the heaps are rebuilt.

### Why Binary Heap?

A binary heap provides efficient insertion and extraction while keeping the implementation relatively simple.

The main operation complexities are:

| Operation | Complexity |
|-----------|------------|
| insert | O(log n) |
| extract_min | O(log n) |
| extract_max | O(log n) |
| peek | O(1) |
| update | O(log n) |
| delete | O(log n) |
| is_empty | O(1) |

## Persistence

The queue uses file-based persistence.

The queue data is stored in:

`priority-queue.json`

The heap structures themselves are not stored. Instead, only the queue items are persisted. When the application starts, the items are loaded and both heaps are rebuilt.

This keeps the persisted format simple and avoids storing derived data.

## Usage

```javascript
const PersistentPriorityQueue = require("./module");

const queue = new PersistentPriorityQueue();

const task = queue.insert("Process payment", 1);

queue.insert("Send email", 5);
queue.insert("Generate report", 10);

console.log(queue.peek());

console.log(queue.extract_min());

queue.update(task.id, 2);

queue.delete(task.id);

console.log(queue.is_empty());
