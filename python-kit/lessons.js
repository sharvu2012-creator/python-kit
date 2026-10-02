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
teacherNotes: "Explain that print() is a function. The text inside quotes is called a string. Python 3 uses parentheses."
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
teacherNotes: "Variable names can't start with numbers, can't have spaces. Use snake_case. Show that variables can be reassigned."
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
teacherNotes: "Emphasize int() conversion. Show what happens without it (string concatenation). Mention float() for decimals."
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
teacherNotes: "Explain == vs =. Show elif for multiple conditions. Indentation = 4 spaces. Boolean operators: and, or, not."
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
teacherNotes: "range(start, stop, step). range(10) is 0-9. range(1, 11) is 1-10. break and continue. Infinite loops with while True."
}
];

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
module.exports = lessons;
}