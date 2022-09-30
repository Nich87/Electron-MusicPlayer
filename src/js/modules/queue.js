export class Queue {
    constructor() {
        this.items = [];
    }

    get size() {
        return this.items.length;
    }

    get isEmpty() {
        return this.items.length == 0;
    }

    index(item) {
        return this.items.indexOf(item);
    }

    add(item) {
        return this.items.push(item);
    }

    remove() { //skip or end(no loop)
        if(this.items.length > 0) {
            return this.items.shift();
        }
    }

    delete(item) {
        if(this.items.indexOf(item) === -1) return;
        return this.items.splice(this.items.indexOf(item),1)
    }

    next() {
        return this.items.push(this.items.shift());
    }

    previous() {
        return this.items.unshift(this.items.pop());
    }

    shuffle() {
        return this.items = random(this.items);
    }

    clear() {
        this.items = [];
    }
}