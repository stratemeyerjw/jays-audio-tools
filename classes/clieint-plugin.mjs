class ClientPlugin{
    constructor(title='unknown client plugin', description = '', category = 'unknown'){
        this.title = title;
        this.description = description;
    }
    Init(){}

}
class AudioPlugin extends ClientPlugin{
    constructor(audioInput, audioOutput){
        super();
        this.audioInput = audioInput;
        this.audioOutput = audioOutput; 
    }
}
class MidiPlugin extends ClientPlugin {
    constructor(midiInput, midiOutput){
        super();
        this.midiInput = midiInput;
        this.midiOutput = midiOutput;
    }
}
if(typeof window !== "undefined"){
    window.Plugins = {ClientPlugin,AudioPlugin,MidiPlugin};
}
export default {ClientPlugin,AudioPlugin,MidiPlugin};

