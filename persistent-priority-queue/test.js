const fs = require("fs");
const assert = require("assert");

const PersistentPriorityQueue = require("./module");

const TEST_FILE = "./test-priority-queue.json";

// Clean test database before starting.
if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
}

const queue = new PersistentPriorityQueue(TEST_FILE);

console.log("Running tests...\n");

// --------------------------------------------------
// insert
// --------------------------------------------------

const task1 = queue.insert("Low priority task", 30);
const task2 = queue.insert("High priority task", 10);
const task3 = queue.insert("Medium priority task", 20);

assert.strictEqual(queue.is_empty(), false);

console.log("✓ insert");

// --------------------------------------------------
// peek
// --------------------------------------------------

assert.strictEqual(queue.peek().value, "High priority task");
assert.strictEqual(queue.peek().priority, 10);

console.log("✓ peek");

// --------------------------------------------------
// extract_min
// --------------------------------------------------

const min = queue.extract_min();

assert.strictEqual(min.value, "High priority task");
assert.strictEqual(min.priority, 10);

console.log("✓ extract_min");

// --------------------------------------------------
// extract_max
// --------------------------------------------------

const max = queue.extract_max();

assert.strictEqual(max.value, "Low priority task");
assert.strictEqual(max.priority, 30);

console.log("✓ extract_max");

// --------------------------------------------------
// update
// --------------------------------------------------

queue.update(task3.id, 5, "Updated task");

assert.strictEqual(queue.peek().id, task3.id);
assert.strictEqual(queue.peek().priority, 5);
assert.strictEqual(queue.peek().value, "Updated task");

console.log("✓ update");

// --------------------------------------------------
// delete
// --------------------------------------------------

const task4 = queue.insert("Task to delete", 100);

const deleted = queue.delete(task4.id);

assert.strictEqual(deleted.id, task4.id);
assert.strictEqual(queue.delete(task4.id), null);

console.log("✓ delete");

// --------------------------------------------------
// Persistence test
// --------------------------------------------------

queue.insert("Persistent task", 1);

const newQueueInstance = new PersistentPriorityQueue(TEST_FILE);

assert.strictEqual(
    newQueueInstance.peek().value,
    "Persistent task"
);

console.log("✓ persistence");

// --------------------------------------------------
// is_empty
// --------------------------------------------------

while (!newQueueInstance.is_empty()) {
    newQueueInstance.extract_min();
}

assert.strictEqual(newQueueInstance.is_empty(), true);

console.log("✓ is_empty");

console.log("\nAll tests passed! ✓");

// Cleanup
if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
}