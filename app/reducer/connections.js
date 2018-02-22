const defaultState = {
    connections: {},
    list: []
}

/* eslint-disable complexity */
export default function connections (state = defaultState, action) {
    switch (action.type) {

        case 'ADD_CONNECTION':
        return addConnection(state, action)

        case 'REMOVE_CONNECTION':
        return removeConnection(state, action)

        case 'SET_URL':
        return setUrl(state, action)

        case 'SET_CONNECTED':
        return setConnected(state, action, true)

        case 'SET_DISCONNECTED':
        return setConnected(state, action, false)

        case 'ADD_EVENT':
        return addEvent(state, action)

        case 'REMOVE_EVENT':
        return removeEvent(state, action)

        case 'TOGGLE_EVENT_VISIBILITY':
        return toggleEventVisibility(state, action)

        default:
        return state
    }
}
/* eslint-enable complexity */

/**
 * Adds connection object to the store (this is where the information on a socket.io connection is kept)
 */
function addConnection (state, action) {
    console.log("addConnection action", action)
    const connections = Object.assign({}, state.connections)

    const id = action.id

    const newConnection = {
        index: state.list.length,
        id
    }

    connections[id] = newConnection

    const list = state.list.slice()

    list.push({
        url: '',
        id,
        disabled: false,
        connected: false,
        events: [],
        order: list.length + 1
    })

    return {
        connections,
        list
    }
}

/**
 * Removes a connection from the list
 */
function removeConnection (state, action) {
    console.log("removeConnection action", action)
    const connection = state.connections[action.id]

    const list = state.list.slice()
    list[connection.index].disabled = true

    return {
        connections: state.connections,
        list
    }
}

/**
 * Updates the url of a connection
 */
function setUrl (state, action) {
    console.log("setUrl action", action)
    const list = state.list.slice()

    const id = action.id

    list[state.connections[id].index].url = action.url
    return {
        connections: state.connections,
        list
    }
}

/**
 * Updates a connection 'connected' status to newValue
 */
function setConnected (state, action, newValue) {
    console.log("setConnected action", action)
    const list = state.list.slice()

    const id = action.id

    list[state.connections[id].index].connected = newValue
    return {
        connections: state.connections,
        list
    }
}

/**
 * Adds an event that a connection should listen to
 */
function addEvent (state, action) {
    console.log("addEvent action", action)
    const list = state.list.slice()

    const id = action.id

    list[state.connections[id].index].events.push(action.event)
    return {
        connections: state.connections,
        list
    }
}

/**
 * Removes an event that a connection should listen to
 */
function removeEvent (state, action) {
    console.log("removeEvent action", action)
    const list = state.list.map(t => Object.assign({}, t))

    const id = action.id

    const eventName = action.eventName

    const connection = list[state.connections[id].index]
    const events = connection.events
    connection.events = events.filter( event => event.name !== eventName )

    list[state.connections[id].index] = connection

    return {
        connections: state.connections,
        list
    }
}

/**
 * Sets the event to hidden, messages will stil be received but not shown
 */
function toggleEventVisibility (state, action) {
    const list = state.list.slice()

    const id = action.id

    const events = list[state.connections[id].index].events.slice()

    const eventName = action.eventName
    for ( let x = 0, l = events.length; x < l; x++ )
        if ( events[x].name === eventName )
            events[x].visible = !events[x].visible

    list[state.connections[id].index].events = events

    return {
        connections: state.connections,
        list
    }
}
