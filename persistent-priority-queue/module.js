const fs = require("fs");
const path = require("path");

class PersistentPriorityQueue {
    constructor(filePath = path.join(__dirname, "priority-queue.json")) {
        this.filePath = filePath;

        this.items = new Map();

        this.minHeap = [];
        this.maxHeap = [];

        this.minPosition = new Map();
        this.maxPosition = new Map();

        this.nextId = 1;

        this.load();
    }

    // --------------------------------------------------
    // Persistence
    // --------------------------------------------------

    load() {
        if (!fs.existsSync(this.filePath)) {
            return;
        }

        try {
            const data = JSON.parse(
                fs.readFileSync(this.filePath, "utf8")
            );

            this.nextId = data.nextId || 1;

            if (Array.isArray(data.items)) {
                for (const item of data.items) {
                    this.items.set(String(item.id), item);
                }
            }

            // Rebuild heaps from persisted items.
            for (const item of this.items.values()) {
                this.addToMinHeap(String(item.id));
                this.addToMaxHeap(String(item.id));
            }
        } catch (error) {
            throw new Error(
                `Failed to load priority queue: ${error.message}`
            );
        }
    }

    persist() {
        const data = {
            nextId: this.nextId,
            items: Array.from(this.items.values())
        };

        const tempFile = `${this.filePath}.tmp`;

        try {
            fs.writeFileSync(
                tempFile,
                JSON.stringify(data, null, 2),
                "utf8"
            );

            // Atomic replacement.
            fs.renameSync(tempFile, this.filePath);
        } catch (error) {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            throw new Error(
                `Failed to persist priority queue: ${error.message}`
            );
        }
    }

    // --------------------------------------------------
    // Utility methods
    // --------------------------------------------------

    compareMin(id1, id2) {
        const a = this.items.get(String(id1));
        const b = this.items.get(String(id2));

        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }

        return Number(a.id) - Number(b.id);
    }

    compareMax(id1, id2) {
        const a = this.items.get(String(id1));
        const b = this.items.get(String(id2));

        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }

        return Number(b.id) - Number(a.id);
    }

    // --------------------------------------------------
    // Min Heap
    // --------------------------------------------------

    addToMinHeap(id) {
        const index = this.minHeap.length;

        this.minHeap.push(String(id));
        this.minPosition.set(String(id), index);

        this.minHeapifyUp(index);
    }

    minHeapifyUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (
                this.compareMin(
                    this.minHeap[index],
                    this.minHeap[parent]
                ) >= 0
            ) {
                break;
            }

            this.swapMinHeap(index, parent);
            index = parent;
        }
    }

    minHeapifyDown(index) {
        const size = this.minHeap.length;

        while (true) {
            let smallest = index;

            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (
                left < size &&
                this.compareMin(
                    this.minHeap[left],
                    this.minHeap[smallest]
                ) < 0
            ) {
                smallest = left;
            }

            if (
                right < size &&
                this.compareMin(
                    this.minHeap[right],
                    this.minHeap[smallest]
                ) < 0
            ) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            this.swapMinHeap(index, smallest);
            index = smallest;
        }
    }

    swapMinHeap(i, j) {
        const temp = this.minHeap[i];

        this.minHeap[i] = this.minHeap[j];
        this.minHeap[j] = temp;

        this.minPosition.set(this.minHeap[i], i);
        this.minPosition.set(this.minHeap[j], j);
    }

    removeMinHeapAt(index) {
        const lastIndex = this.minHeap.length - 1;
        const removedId = this.minHeap[index];

        if (index === lastIndex) {
            this.minHeap.pop();
            this.minPosition.delete(removedId);
            return removedId;
        }

        this.swapMinHeap(index, lastIndex);

        this.minHeap.pop();
        this.minPosition.delete(removedId);

        if (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (
                this.compareMin(
                    this.minHeap[index],
                    this.minHeap[parent]
                ) < 0
            ) {
                this.minHeapifyUp(index);
                return removedId;
            }
        }

        this.minHeapifyDown(index);

        return removedId;
    }

    // --------------------------------------------------
    // Max Heap
    // --------------------------------------------------

    addToMaxHeap(id) {
        const index = this.maxHeap.length;

        this.maxHeap.push(String(id));
        this.maxPosition.set(String(id), index);

        this.maxHeapifyUp(index);
    }

    maxHeapifyUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (
                this.compareMax(
                    this.maxHeap[index],
                    this.maxHeap[parent]
                ) >= 0
            ) {
                break;
            }

            this.swapMaxHeap(index, parent);
            index = parent;
        }
    }

    maxHeapifyDown(index) {
        const size = this.maxHeap.length;

        while (true) {
            let largest = index;

            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (
                left < size &&
                this.compareMax(
                    this.maxHeap[left],
                    this.maxHeap[largest]
                ) < 0
            ) {
                largest = left;
            }

            if (
                right < size &&
                this.compareMax(
                    this.maxHeap[right],
                    this.maxHeap[largest]
                ) < 0
            ) {
                largest = right;
            }

            if (largest === index) {
                break;
            }

            this.swapMaxHeap(index, largest);
            index = largest;
        }
    }

    swapMaxHeap(i, j) {
        const temp = this.maxHeap[i];

        this.maxHeap[i] = this.maxHeap[j];
        this.maxHeap[j] = temp;

        this.maxPosition.set(this.maxHeap[i], i);
        this.maxPosition.set(this.maxHeap[j], j);
    }

    removeMaxHeapAt(index) {
        const lastIndex = this.maxHeap.length - 1;
        const removedId = this.maxHeap[index];

        if (index === lastIndex) {
            this.maxHeap.pop();
            this.maxPosition.delete(removedId);
            return removedId;
        }

        this.swapMaxHeap(index, lastIndex);

        this.maxHeap.pop();
        this.maxPosition.delete(removedId);

        if (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (
                this.compareMax(
                    this.maxHeap[index],
                    this.maxHeap[parent]
                ) < 0
            ) {
                this.maxHeapifyUp(index);
                return removedId;
            }
        }

        this.maxHeapifyDown(index);

        return removedId;
    }

    // --------------------------------------------------
    // Required Operations
    // --------------------------------------------------

    insert(value, priority) {
        if (priority === undefined || typeof priority !== "number") {
            throw new TypeError("Priority must be a number.");
        }

        const item = {
            id: this.nextId++,
            value,
            priority
        };

        const id = String(item.id);

        this.items.set(id, item);

        this.addToMinHeap(id);
        this.addToMaxHeap(id);

        this.persist();

        return item;
    }

    extract_min() {
        if (this.is_empty()) {
            return null;
        }

        const id = this.minHeap[0];

        this.removeMinHeapAt(0);

        const maxIndex = this.maxPosition.get(id);

        if (maxIndex !== undefined) {
            this.removeMaxHeapAt(maxIndex);
        }

        const item = this.items.get(id);

        this.items.delete(id);

        this.persist();

        return item;
    }

    extract_max() {
        if (this.is_empty()) {
            return null;
        }

        const id = this.maxHeap[0];

        this.removeMaxHeapAt(0);

        const minIndex = this.minPosition.get(id);

        if (minIndex !== undefined) {
            this.removeMinHeapAt(minIndex);
        }

        const item = this.items.get(id);

        this.items.delete(id);

        this.persist();

        return item;
    }

    peek() {
        if (this.is_empty()) {
            return null;
        }

        const id = this.minHeap[0];

        return this.items.get(id);
    }

    update(id, newPriority, newValue) {
        const key = String(id);

        const item = this.items.get(key);

        if (!item) {
            return null;
        }

        if (
            newPriority !== undefined &&
            typeof newPriority !== "number"
        ) {
            throw new TypeError("Priority must be a number.");
        }

        if (newPriority !== undefined) {
            item.priority = newPriority;
        }

        if (newValue !== undefined) {
            item.value = newValue;
        }

        const minIndex = this.minPosition.get(key);

        if (minIndex !== undefined) {
            this.minHeapifyUp(minIndex);
            this.minHeapifyDown(
                this.minPosition.get(key)
            );
        }

        const maxIndex = this.maxPosition.get(key);

        if (maxIndex !== undefined) {
            this.maxHeapifyUp(maxIndex);
            this.maxHeapifyDown(
                this.maxPosition.get(key)
            );
        }

        this.persist();

        return item;
    }

    delete(id) {
        const key = String(id);

        if (!this.items.has(key)) {
            return null;
        }

        const minIndex = this.minPosition.get(key);

        if (minIndex !== undefined) {
            this.removeMinHeapAt(minIndex);
        }

        const maxIndex = this.maxPosition.get(key);

        if (maxIndex !== undefined) {
            this.removeMaxHeapAt(maxIndex);
        }

        const item = this.items.get(key);

        this.items.delete(key);

        this.persist();

        return item;
    }

    is_empty() {
        return this.items.size === 0;
    }
}

module.exports = PersistentPriorityQueue;