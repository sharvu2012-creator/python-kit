const lessons = [
{
title: { pa: "ਪ੍ਰਿੰਟ ਕਰਨਾ", en: "Print Statement" },
text: {
pa: "ਪ੍ਰਿੰਟ ਫੰਕਸ਼ਨ ਸਕਰੀਨ 'ਤੇ ਲਿਖਣ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ। ਇਹ ਸਭ ਤੋਂ ਬੁਨਿਆਦੀ ਕਮਾਂਡ ਹੈ ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਆਪਣੇ ਪ੍ਰੋਗਰਾਮ ਦਾ ਆਉਟਪੁੱਟ ਦੇਖ ਸਕਦੇ ਹੋ।",
en: "The print function displays text on the screen. It's the most basic command that lets you see your program's output."
},
starter: 'print("Hello, World!")',
task: {
pa: 'ਆਪਣਾ ਨਾਮ ਪ੍ਰਿੰਟ ਕਰੋ: print("ਅਪਣਾ ਨਾਮ")',
en: 'Print your name: print("Your Name")'
},
teacherNotes: "Explain that print() is a function. The text inside quotes is called a string. Python 3 uses parentheses.",
quiz: [
{ q: "What does print() do?", options: ["Deletes text", "Displays output on screen", "Saves a file", "Reads input"], answer: 1, explain: "print() shows your program's output on the screen." },
{ q: "Which line is correct Python?", options: ['print "Hi"', 'Print("Hi")', 'print("Hi")', 'echo("Hi")'], answer: 2, explain: "print is lowercase and needs parentheses." },
{ q: 'What does print("2 + 2") show?', options: ["4", "2 + 2", "22", "Error"], answer: 1, explain: "Inside quotes it's a string — Python shows it exactly as written." }
]
},
{
title: { pa: "ਵੇਰੀਏਬਲਜ਼ (ਚਲ)", en: "Variables" },
text: {
pa: "ਵੇਰੀਏਬਲ ਇੱਕ ਬਾਕਸ ਹੈ ਜਿਸ ਵਿੱਚ ਤੁਸੀਂ ਮੁੱਲ ਸਟੋਰ ਕਰਦੇ ਹੋ। ਪਾਇਥਨ ਵਿੱਚ ਤੁਹਾਨੂੰ ਵੇਰੀਏਬਲ ਦਾ ਕਿਸਮ ਦੱਸਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਇਹ ਆਪਣੇ आप ਸਮਝ ਜਾਂਦਾ ਹੈ।",
en: "A variable is a box that stores a value. Python figures out the type automatically — you don't need to declare it."
},
starter: 'name = "Alex"\nage = 14\nprint("Name:", name)\nprint("Age:", age)',
task: {
pa: 'ਆਪਣੀ ਉਮਰ ਅਤੇ ਪਸੰਦੀਦਾ ਰੰਗ ਦੇ ਵੇਰੀਏਬਲ ਬਣਾਓ ਅਤੇ ਉਹਨਾਂ ਨੂੰ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Create variables for your age and favorite color, then print them.'
},
teacherNotes: "Variable names can't start with numbers, can't have spaces. Use snake_case. Show that variables can be reassigned.",
quiz: [
{ q: "A variable is…", options: ["A named box that stores a value", "A type of loop", "A computer part", "A print command"], answer: 0, explain: "Variables store values under a name you choose." },
{ q: "Which is a valid variable name?", options: ["my-var", "my var", "my_var", "2var"], answer: 2, explain: "No hyphens, no spaces, and names can't start with a number." },
{ q: "x = 5 then x = 9 then print(x) shows…", options: ["5", "14", "9", "Error"], answer: 2, explain: "Reassigning replaces the old value — x is 9 now." }
]
},
{
title: { pa: "ਇਨਪੁਟ ਲੈਣਾ", en: "Getting Input" },
text: {
pa: "input() ਫੰਕਸ਼ਨ ਵਰਤੋਂਕਾਰ ਤੋਂ ਜਾਣਕਾਰੀ ਲੈਂਦੀ ਹੈ। ਇਹ ਹਮੇਸ਼ਾ ਇੱਕ ਸਟ੍ਰਿੰਗ ਵਾਪਸ ਕਰਦੀ ਹੈ, ਇਸ ਲਈ ਗਿਣਤੀ ਲਈ int() ਵਿੱਚ ਬਦਲੋ।",
en: "input() gets text from the user. It always returns a string, so use int() to convert for math."
},
starter: 'name = input("Your name: ")\nage = int(input("Your age: "))\nprint("Hi", name, "! Next year you will be", age + 1)',
task: {
pa: 'ਵਰਤੋਂਕਾਰ ਤੋਂ ਦੋ ਗਿਣਤੀਆਂ ਲਓ ਅਤੇ ਉਨ੍ਹਾਂ ਦਾ ਜੋੜ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Ask the user for two numbers and print their sum.'
},
teacherNotes: "Emphasize int() conversion. Show what happens without it (string concatenation). Mention float() for decimals.",
quiz: [
{ q: "input() always returns a…", options: ["number", "string", "list", "boolean"], answer: 1, explain: "Everything typed into input() comes back as a string." },
{ q: 'To do math with input, you need…', options: ["math()", "int()", "sum()", "num()"], answer: 1, explain: "int() converts the string to a number." },
{ q: 'age = input() → user types 7 → age + 1 gives…', options: ["8", "71", "Error or joined text", "7"], answer: 2, explain: "Without int(), you can't add 1 to a string — it errors or sticks together." }
]
},
{
title: { pa: "ਜੇ/ਨਹੀਂ (If/Else)", en: "If / Else" },
text: {
pa: "if ਅਤੇ else ਨਾਲ ਤੁਸੀਂ ਫੈਸਲੇ ਲੈ ਸਕਦੇ ਹੋ। ਜੇ ਸ਼ਰਤ ਸਹੀ ਹੈ ਤਾਂ if ਬਲਾਕ ਚੱਲਦਾ ਹੈ, ਨਹੀਂ ਤਾਂ else। ਡੋਂਗਾ ਲਗਾਉਣਾ (ਇੰਡੈਂਟੇਸ਼ਨ) ਜ਼ਰੂਰੀ ਹੈ।",
en: "if and else let your program make decisions. If the condition is true, the if block runs; otherwise else runs. Indentation matters!"
},
starter: 'age = int(input("Age: "))\nif age >= 18:\n    print("You are an adult")\nelse:\n    print("You are a minor")',
task: {
pa: 'ਇੱਕ ਸੰਖਿਆ ਲਓ। ਜੇ ਉਹ ਜੋੜੀ ਹੈ ਤਾਂ "Even" ਪ੍ਰਿੰਟ ਕਰੋ, ਨਹੀਂ ਤਾਂ "Odd"।',
en: 'Ask for a number. Print "Even" if divisible by 2, otherwise "Odd".'
},
teacherNotes: "Explain == vs =. Show elif for multiple conditions. Indentation = 4 spaces. Boolean operators: and, or, not.",
quiz: [
{ q: "The if block runs when…", options: ["the condition is True", "always", "the condition is False", "never"], answer: 0, explain: "if runs only when its condition is True; else catches the rest." },
{ q: "Which checks if two things are EQUAL?", options: ["=", "==", "===", "!="], answer: 1, explain: "= assigns, == compares. A classic beginner trap!" },
{ q: "Python blocks need indentation of…", options: ["1 space", "2 spaces", "4 spaces", "a tab is mandatory"], answer: 2, explain: "The standard is 4 spaces." }
]
},
{
title: { pa: "ਲੂਪ (ਲੁਪ)", en: "Loops" },
text: {
pa: "for ਲੁਪ ਇੱਕ ਸੂਚੀ 'ਤੇ ਜਾਂ ਰੇਂਜ 'ਤੇ ਚੱਲਦਾ ਹੈ। while ਲੁਪ ਤਦ ਤੱਕ ਚੱਲਦਾ ਹੈ ਜਦੋਂ ਤੱਕ ਸ਼ਰਤ ਸਹੀ ਹੈ।",
en: "for loops iterate over a list or range. while loops run as long as a condition is true."
},
starter: 'for i in range(5):\n    print("Count:", i)\n\nprint("---")\n\ncount = 0\nwhile count < 3:\n    print("While:", count)\n    count += 1',
task: {
pa: '1 ਤੋਂ 10 ਤੱਕ ਸਾਰੀਆਂ ਜੋੜੀਆਂ ਸੰਖਿਆਵਾਂ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Print all even numbers from 1 to 10.'
},
teacherNotes: "range(start, stop, step). range(10) is 0-9. range(1, 11) is 1-10. break and continue. Infinite loops with while True.",
quiz: [
{ q: "range(5) produces…", options: ["1,2,3,4,5", "0,1,2,3,4", "0,1,2,3,4,5", "5 numbers starting at 1"], answer: 1, explain: "range starts at 0 and stops before 5." },
{ q: "Which keyword loops over a list?", options: ["loop", "repeat", "for", "cycle"], answer: 2, explain: "for item in list: is the pattern." },
{ q: "A while loop stops when…", options: ["it counts to 10", "its condition becomes False", "you say stop", "never"], answer: 1, explain: "while keeps going while the condition stays True." }
]
},
{
title: { pa: "ਸੂਚੀਆਂ (Lists)", en: "Lists" },
text: {
pa: "ਸੂਚੀ ਇੱਕ ਹੀ ਵੇਰੀਏਬਲ ਵਿੱਚ ਕਈ ਚੀਜ਼ਾਂ ਰੱਖਣ ਦਾ ਤਰੀਕਾ ਹੈ। ਹਰ ਚੀਜ਼ ਦਾ ਇੱਕ ਨੰਬਰ (ਇੰਡੈਕਸ) ਹੁੰਦਾ ਹੈ ਜੋ 0 ਤੋਂ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ।",
en: "A list stores many items in one variable. Each item has a position number (index) starting at 0. Lists can grow, shrink, and change."
},
starter: 'fruits = ["apple", "banana", "mango"]\nprint(fruits[0])\nfruits.append("orange")\nprint(fruits)\nprint("Total:", len(fruits))',
task: {
pa: 'ਆਪਣੀਆਂ 3 ਪਸੰਦੀਦਾ ਫਿਲਮਾਂ ਦੀ ਸੂਚੀ ਬਣਾਓ ਅਤੇ ਪਹਿਲੀ ਫਿਲਮ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Make a list of your 3 favorite movies and print the first one.'
},
teacherNotes: "Indexes start at 0. append() adds, remove() deletes, len() counts. Show fruits[-1] for the last item.",
quiz: [
{ q: "How do you create a list?", options: ["(1,2,3)", "[1,2,3]", "{1,2,3}", "<1,2,3>"], answer: 1, explain: "Square brackets make a list." },
{ q: 'In fruits = ["a","b","c"], what is fruits[0]?', options: ["c", "b", "a", "Error"], answer: 2, explain: "Indexes start at 0, so index 0 is the first item." },
{ q: "Which adds an item to a list?", options: ["add()", "push()", "append()", "insert()"], answer: 2, explain: "list.append(item) adds to the end." }
]
},
{
title: { pa: "ਸਟ੍ਰਿੰਗਜ਼ (Strings)", en: "Strings & f-strings" },
text: {
pa: "ਸਟ੍ਰਿੰਗ ਅੱਖਰਾਂ ਦੀ ਲੜੀ ਹੈ। f-string ਨਾਲ ਤੁਸੀਂ ਵੇਰੀਏਬਲ ਨੂੰ ਸਿੱਧਾ ਟੈਕਸਟ ਵਿੱਚ ਪਾ ਸਕਦੇ ਹੋ।",
en: "A string is a sequence of characters. f-strings let you drop variables right into text. Strings also come with handy methods like upper(), lower(), and len()."
},
starter: 'name = "Sam"\nage = 15\nprint(f"Hi {name}, you are {age} years old")\nprint(name.upper())\nprint(len(name))',
task: {
pa: 'f-string ਨਾਲ ਆਪਣਾ ਨਾਮ ਅਤੇ ਸ਼ਹਿਰ ਇੱਕ ਵਾਕ ਵਿੱਚ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Use an f-string to print your name and city in one sentence.'
},
teacherNotes: "f\"...\" with {variable} inside. Methods: upper, lower, strip, replace, len().",
quiz: [
{ q: 'name = "Sam" → f"Hi {name}" gives…', options: ["Hi {name}", "Hi Sam", "Hi name", "Error"], answer: 1, explain: "f-strings replace {variable} with its value." },
{ q: '"py".upper() returns…', options: ["py", "PY", "Py", "pY"], answer: 1, explain: "upper() makes the whole string capital." },
{ q: 'len("hello") equals…', options: ["4", "5", "6", "hello"], answer: 1, explain: "len() counts characters: h-e-l-l-o = 5." }
]
},
{
title: { pa: "ਫੰਕਸ਼ਨ (Functions)", en: "Functions" },
text: {
pa: "ਫੰਕਸ਼ਨ ਕੋਡ ਦਾ ਇੱਕ ਛੋਟਾ ਮਸ਼ੀਨ ਹੈ — ਇੱਕ ਵਾਰ ਲਿਖੋ, ਬਾਰ-ਬਾਰ ਵਰਤੋ। def ਨਾਲ ਬਣਾਉਂਦੇ ਹਾਂ ਅਤੇ ਨਾਮ ਨਾਲ ਬੁਲਾਉਂਦੇ ਹਾਂ।",
en: "A function is a mini-machine for code — write it once with def, use it many times by calling its name. Functions can take inputs (parameters) and send back results with return."
},
starter: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Alex"))\nprint(greet("Sam"))',
task: {
pa: 'add(a, b) ਨਾਂ ਦਾ ਫੰਕਸ਼ਨ ਬਣਾਓ ਜੋ ਦੋ ਗਿਣਤੀਆਂ ਦਾ ਜੋੜ ਵਾਪਸ ਕਰੇ।',
en: 'Write a function add(a, b) that returns the sum of two numbers.'
},
teacherNotes: "def name(params): indented body. return sends a value back. Call with name(args). Reusability is the point.",
quiz: [
{ q: "Which keyword creates a function?", options: ["func", "def", "function", "make"], answer: 1, explain: "def greet(): defines a function." },
{ q: "What does return do?", options: ["Prints text", "Sends a value back and exits", "Loops again", "Deletes the function"], answer: 1, explain: "return hands a result back to whoever called the function." },
{ q: "def hi(): print('hey') — how do you run it?", options: ["run hi", "hi()", "call hi", "def hi"], answer: 1, explain: "Call it with parentheses: hi()" }
]
},
{
title: { pa: "ਡਿਕਸ਼ਨਰੀ (Dictionaries)", en: "Dictionaries" },
text: {
pa: "ਡਿਕਸ਼ਨਰੀ key:value ਜੋੜੇ ਰੱਖਦੀ ਹੈ — ਜਿਵੇਂ ਸ਼ਬਦਕੋਸ਼ ਵਿੱਚ ਹਰ ਸ਼ਬਦ ਦਾ ਇੱਕ ਅਰਥ ਹੁੰਦਾ ਹੈ।",
en: "A dictionary stores key:value pairs — like a real dictionary where every word (key) has a meaning (value). Look things up by their key, not by position."
},
starter: 'student = {"name": "Alex", "age": 14, "grade": "A"}\nprint(student["name"])\nstudent["city"] = "Delhi"\nprint(student)',
task: {
pa: 'ਆਪਣੇ ਬਾਰੇ ਇੱਕ ਡਿਕਸ਼ਨਰੀ ਬਣਾਓ (ਨਾਮ, ਉਮਰ, ਸ਼ਹਿਰ) ਅਤੇ ਨਾਮ ਪ੍ਰਿੰਟ ਕਰੋ।',
en: 'Make a dictionary about yourself (name, age, city) and print the name.'
},
teacherNotes: "Curly braces with 'key': value. Access with d[key]. Keys must be unique. dict.keys(), dict.values(), dict.items().",
quiz: [
{ q: "A dictionary stores…", options: ["only numbers", "key:value pairs", "only strings", "indexes"], answer: 1, explain: "Each entry is a key pointing to a value." },
{ q: 'person = {"age": 14} — how do you get 14?', options: ['person[0]', 'person(age)', 'person["age"]', 'get person.age'], answer: 2, explain: "Look up values by their key in square brackets." },
{ q: 'How do you add city to person?', options: ['person.append("Delhi")', 'person["city"] = "Delhi"', 'person.add(city)', 'push person "Delhi"'], answer: 1, explain: "Assign a new key with d[key] = value." }
]
},
{
title: { pa: "ਮੋਡੀਊਲ ਅਤੇ ਫਾਇਨਲ ਚੁਣੌਤੀ", en: "Modules & Final Challenge" },
text: {
pa: "ਮੋਡੀਊਲ ਦੂਜਿਆਂ ਦੇ ਤਿਆਰ ਕੋਡ ਨੂੰ ਵਰਤਣ ਦਾ ਤਰੀਕਾ ਹੈ — import ਕਰੋ ਅਤੇ ਦੁਨੀਆਂ ਦੀ ਸ਼ਕਤੀ ਤੁਹਾਡੇ ਹੱਥ ਵਿੱਚ।",
en: "Modules let you use code others already wrote — just import and go. Python has hundreds built in: random for games, math for calculations, datetime for dates. This is your final challenge: combine everything you've learned!"
},
starter: 'import random\n\nsecret = random.randint(1, 10)\nguess = int(input("Guess 1-10: "))\n\nif guess == secret:\n    print("You win! 🎉")\nelse:\n    print(f"Nope, it was {secret}")',
task: {
pa: 'import random ਵਰਤ ਕੇ ਆਪਣਾ ਗੇਮ ਬਣਾਓ — ਸਿੱਕਾ ਉਛਾਲੋ (Heads/Tails)।',
en: 'Use import random to make a coin-flip game (Heads or Tails).'
},
teacherNotes: "import module, then module.function(). random.randint(a,b) inclusive range. This lesson is a capstone — celebrate finishing!",
quiz: [
{ q: "How do you use a module?", options: ["use module", "import module", "get module", "module.start()"], answer: 1, explain: "import random, then call random.something()." },
{ q: "random.randint(1, 6) is like rolling a…", options: ["coin", "dice", "card", "wheel"], answer: 1, explain: "A random whole number from 1 to 6 — a dice roll!" },
{ q: "The best way to learn Python is…", options: ["watching videos only", "reading books only", "building things yourself", "memorizing syntax"], answer: 2, explain: "You just did it — build, break, fix, repeat. You're a Python coder now! 🎉" }
]
}
];

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
module.exports = lessons;
}