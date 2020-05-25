const client = io()

// Form Elements
const $messageForm = document.querySelector('#message-form')
const $sendMessageButton = document.querySelector('#sendMessage')
const $messageFormInput = document.querySelector('#message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

client.on('broadcastMsg', (message) => {
    console.log(message)
    const msgHtml = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', msgHtml)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable send button 
    $sendMessageButton.setAttribute('disabled', 'disabled')
    const message = $messageFormInput.value
    client.emit('acknowledgeMessage', message, (error) => {
        // enable send button and create focus on input
        $sendMessageButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Delivered !!")
    })
})

// send current location
$sendLocationButton.addEventListener('click', (e) => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation)
        alert("Geo loaction do not support")
    navigator.geolocation.getCurrentPosition((position) => {
        client.emit('geoLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("location shared !")
        })
    })
})

// print current location 
client.on('locationMessage', (location) => {
    console.log(location)
    const msgHtml = Mustache.render(locationMessageTemplate, {
        url: location.text,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', msgHtml)
})

// joining chat room
client.emit('join', { username, room })