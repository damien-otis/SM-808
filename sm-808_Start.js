/*_______________________________________________________
@module SM-808 Initialization
*/

/*_______________________________________________________
@function start
@description The main initialization function. It starts a single sequence. It could support up to 6 sequencers, limited by Web Audio API AudioContext instances.
@arguments n/a
@returns undefined
@public
*/
function start() {
	window.browser_is_mobile = (document.body.ontouchstart === null)

	var AudioContext = (window.AudioContext||window.webkitAudioContext);
	var audio_context = new AudioContext();

	var Seq = new Sequencer();

	Seq.Instruments = []

	var progress = getDom("Loading_Progress_Bar")
	progress.style.left = "-256px"

	getFile("Samples/list.json",function(err,res){

		if (res) {
			var instrument_list = JSON.parse(res)

			var instruments_to_load = instrument_list.length;

			var New_Instrument = newDom("div");
			New_Instrument.className = "New_Instrument";
			New_Instrument.innerHTML = '<div class="message">Choose an Instrument</div>'
			var List = newDom("ul")
			addDom(List,New_Instrument);
			var Close = addDom(newDom("button"),New_Instrument);
			Close.innerText = "CLOSE"
			Close.className = "close"
			Close.onclick = function(){
				New_Instrument.style.display="none"
			}

			function newInst(callback) {
				if (instrument_list.length==0) {
					callback()
					return
				}
				var this_instrument = instrument_list.shift()
				var this_name = this_instrument.split(".mp3")[0]

				var li = addDom(newDom("li"),List);
				var info = addDom(newDom("div"),li);
				info.innerText = this_name;

				var instrument_config = {
					url				: "Samples/"+this_instrument,
					audio_context	: audio_context,
					name			: this_name,
					viewport		: li,
					view_width		: 100,
					view_height		: 100,
					autoplay		: false,
					onLoad			: function onLoad(){
						addDom(New_Instrument);
						newInst(callback)
					}
				}
				var this_instrument = new Instrument(instrument_config)

				var addButton = addDom(newDom("button"),li)
				addButton.innerHTML = "ADD"
				addButton.onclick = function(){
					Seq.addInstrument(instrument_config)
				}

				var prog = (instrument_list.length / instruments_to_load)
				progress.style.left = ((prog*-256))+"px"

				Seq.Instruments.push(instrument_config)
			}

			newInst(function(){
				getDom("Loading").style.display = "none"

				//Load and play default song
				getFile("default_pattern.json",function(err,res){
					if (res){
						var song = JSON.parse(res)
						Seq.loadSong(song)
						setTimeout(Seq.play,100)
					}
				})
			})
		}
	})

console.log("STARTED")

}
