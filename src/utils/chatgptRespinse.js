import Together from "together-ai";

const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
});

export const chatgptResponse = async (product, allergies, medicalHistory) => {
    const prompt = generateDynamicPrompt(product, allergies, medicalHistory);

    const chatCompletion = await together.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
    });

    const response = chatCompletion.choices[0].message.content;

    const lines = response.split("\n\n");
    console.log(lines)

    const fullAnalysis = lines[lines.length - 1].split(":");

    const healthMeter = lines[lines.length - 2].includes('-') ? lines[lines.length - 2].split(" - ") : lines[lines.length - 2].split(":")
    console.log(healthMeter[1])

    const num = healthMeter[1].split("/")
    const HM = num[0];

    const description = fullAnalysis[1]

    const pattern = / - \d\/10 - /;

    const filteredList = lines.filter(item => pattern.test(item));

    const result = filteredList.map(item => item.split(' - ').map(subItem => subItem.trim()));

    return {result, description, HM};
};

const generateDynamicPrompt = (product, allergies, medicalHistory) => {
    const { name, category, type, nutritions, ingredients } = product;

    return `Role: Product Nutritional Value Analyst

Task: Perform nutrition analysis in detail and only give health meter of each nutrition out of 10 based on given Health Concerns: 
Name: ${name} 
Category: ${category} 
Type: ${type}
Nutritional Content: ${nutritions}
Ingredients: ${ingredients}
Dynamic Health Concerns: ${allergies}, ${medicalHistory}
Instructions for Analysis:
1 - nutrition wise health meter with nutrition name if particular nutrition is not good then rate low and if it is good then rate high
2 - overall health meter
3 - give overall analysis of the product according to given allergies and medical history in detail with Analysis heading in last required and important and give major preference to the allergies
Output Instruction:
1- can you filter thi given data into nutrition name, healthmeter and analysis in tabular form and only give table without heading
Output Example - Energy - 5/10 - analysis of the nutient according to the health concern \n\n
Fat - 4/10 - analysis of the nutient according to the health concern
Do not give extra lines like heading of the table, atrribute of the table`;
};
