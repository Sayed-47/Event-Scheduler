class BST {
    constructor() {
        this.root = null;
    }

    insert(event) {
        const node = { event, left: null, right: null };
        
        if (!this.root) {
            this.root = node;
            return;
        }

        this.insertNode(this.root, node);
    }

    insertNode(root, node) {
        if (node.event.date < root.event.date) {
            if (!root.left) {
                root.left = node;
            } else {
                this.insertNode(root.left, node);
            }
        } else {
            if (!root.right) {
                root.right = node;
            } else {
                this.insertNode(root.right, node);
            }
        }
    }

    inOrder(node = this.root, result = []) {
        if (node) {
            this.inOrder(node.left, result);
            result.push(node.event);
            this.inOrder(node.right, result);
        }
        return result;
    }

    search(date, node = this.root) {
        if (!node) return null;
        
        if (date.getTime() === node.event.date.getTime()) {
            return node.event;
        } else if (date < node.event.date) {
            return this.search(date, node.left);
        } else {
            return this.search(date, node.right);
        }
    }

    findMin(node = this.root) {
        if (!node) return null;
        while (node.left) {
            node = node.left;
        }
        return node.event;
    }

    findMax(node = this.root) {
        if (!node) return null;
        while (node.right) {
            node = node.right;
        }
        return node.event;
    }
}