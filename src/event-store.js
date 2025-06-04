import EventEmitter  from "events"

class EventStore extends EventEmitter{
    constructor(initialState={}){
        super()
        this.state = initialState
    }

    setState(updateState){
        let prevState = this.state
        let newState = {...prevState, ...updateState}
        this.state = newState
        this.emit("update", prevState, newState )
    }

   enlist(listener){
     this.on("update", listener)
     return ()=> this.off("update", listener)
   }

   getState(){
    return this.state
   }

}

export default EventStore