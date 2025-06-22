class BSTNode {
    constructor(event) {
        this.event = event;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(event) {
        this.root = this.insertRecursive(this.root, event);
    }

    insertRecursive(node, event) {
        if (node === null) {
            return new BSTNode(event);
        }

        if (event.date < node.event.date) {
            node.left = this.insertRecursive(node.left, event);
        } else {
            node.right = this.insertRecursive(node.right, event);
        }

        return node;
    }

    search(date) {
        return this.searchRecursive(this.root, date);
    }

    searchRecursive(node, date) {
        if (node === null) {
            return null;
        }

        if (date.getTime() === node.event.date.getTime()) {
            return node.event;
        }

        if (date < node.event.date) {
            return this.searchRecursive(node.left, date);
        } else {
            return this.searchRecursive(node.right, date);
        }
    }

    delete(event) {
        this.root = this.deleteRecursive(this.root, event);
    }

    deleteRecursive(node, event) {
        if (node === null) {
            return null;
        }

        if (event.id === node.event.id) {
            if (node.left === null && node.right === null) {
                return null;
            }
            if (node.left === null) {
                return node.right;
            }
            if (node.right === null) {
                return node.left;
            }

            const minRight = this.findMin(node.right);
            node.event = minRight;
            node.right = this.deleteRecursive(node.right, minRight);
        } else if (event.date < node.event.date) {
            node.left = this.deleteRecursive(node.left, event);
        } else {
            node.right = this.deleteRecursive(node.right, event);
        }

        return node;
    }

    findMin(node) {
        while (node.left !== null) {
            node = node.left;
        }
        return node.event;
    }

    inorderTraversal() {
        const result = [];
        this.inorderRecursive(this.root, result);
        return result;
    }

    inorderRecursive(node, result) {
        if (node !== null) {
            this.inorderRecursive(node.left, result);
            result.push(node.event);
            this.inorderRecursive(node.right, result);
        }
    }

    getEventsInRange(startDate, endDate) {
        const result = [];
        this.getRangeRecursive(this.root, startDate, endDate, result);
        return result;
    }

    getRangeRecursive(node, startDate, endDate, result) {
        if (node === null) {
            return;
        }

        if (node.event.date >= startDate && node.event.date <= endDate) {
            result.push(node.event);
        }

        if (node.event.date > startDate) {
            this.getRangeRecursive(node.left, startDate, endDate, result);
        }

        if (node.event.date < endDate) {
            this.getRangeRecursive(node.right, startDate, endDate, result);
        }
    }
}

export default BST;