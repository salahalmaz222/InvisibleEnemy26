
async function ask(topic){

const res = await fetch("http://localhost:5000/ai/"+topic)
const data = await res.json()

document.getElementById("result").innerText=data.response

}
