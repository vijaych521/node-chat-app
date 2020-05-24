const client = io()

client.on('broadcastMsg', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    client.emit('acknowledgeMessage', message)
})