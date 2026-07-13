const person = {
    name: "Ali",
    age: 30
};

const map = new Map();

map.set(person, "Developer");
map.set("name", "Ali");

console.log(map.get(person));
console.log(map.get("name"));
console.log(person);


const fruits = new Map();

fruits.set("apple", "red");
fruits.set("apple", "green");
console.log(fruits.get("apple"));

