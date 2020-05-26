const client = io()

// Form Elements
const $messageForm = document.querySelector('#message-form')
const $sendMessageButton = document.querySelector('#sendMessage')
const $messageFormInput = document.querySelector('#message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// auto scroll
const autoScroll = () => {
    // get New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // 44+16

    // visible height 
    const visibleHeight = $messages.offsetHeight // 44 

    // height of messages container 
    const containerHeight = $messages.scrollHeight
    // how far I have scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    if($messages.scrollTop === 0 &&  containerHeight > scrollOffset){
        alert("new message")
        $messages.scrollTop = $messages.scrollHeight
    }
}

// reciving messages
client.on('broadcastMsg', (message) => {
    console.log(message)
    const msgHtml = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', msgHtml)
    autoScroll()
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
client.on('locationMessage', (locationMsg) => {
    console.log(locationMsg)
    const msgHtml = Mustache.render(locationMessageTemplate, {
        username: locationMsg.username,
        url: locationMsg.text,
        createdAt: moment(locationMsg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', msgHtml)
    autoScroll()
})

// joining chat room
client.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

// getting users present in user room
client.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room.toUpperCase(),
        users
    })
    $sidebar.innerHTML = html
})