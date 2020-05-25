const client = io()


client.on('broadcastMsg', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    client.emit('acknowledgeMessage', message, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log("Delivered !!")
    })
})

// send current location
document.querySelector('#send-location').addEventListener('click', (e) => {
    if (!navigator.geolocation)
        alert("Geo loaction do not support")
    navigator.geolocation.getCurrentPosition((position) => {
        
        client.emit('geoLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log("location shared !")
        })
    })
})