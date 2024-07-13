console.log('Lets write javascript');
let currentsong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`)
    let response = await a.text();
    //console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML=" "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", "")}</div>
                                <div>Shweta</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
                             </li>`;
    }
    //attach an event listenerto each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}
const playMusic = (track,pause=false) => {
    //let audio=new Audio("/songs/"+track)
    currentsong.src = `/${currFolder}/`+ track
    if(!pause){
        currentsong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
   // console.log("displaying albums")
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    //console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if(e.href.includes("/songs/")){
        let folder=e.href.split("/").slice(-1)[0]//for geeting folder name
           // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
    let response = await a.json();
    console.log(response)
    cardContainer.innerHTML= cardContainer.innerHTML+`<div data-folder="${folder}" class="card">
    <div class="play">
        <div class="circle-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                fill="none" class="injected-svg" data-src="/icons/play-stroke-sharp.svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
                <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5"
                    stroke-linejoin="round"></path>
            </svg>
        </div>
    </div>
    <img src="/songs/${folder}/cover.jpg" alt="">
    <h2>${response.title}</h2>
    <p>${response.description}</p>
</div>`
        }
    }
    //load the playlist whenever the card is called
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
           getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            //playMusic(songs[0])

        })
    })    
    //add an event listeiner for previous and next song
    previous.addEventListener("click",()=>{
        console.log(currentsong)
        let index= songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1)>=0)
        playMusic(songs[index-1])
    })
    next.addEventListener("click",()=>{
        currentsong.pause()
        let index= songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length)
        playMusic(songs[index+1])
    })
}

async function main() {
    //get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0],true)
  //display all the folders on the page
    displayAlbums()
    //attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", ()=> {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left =(currentsong.currentTime/currentsong.duration)*100 +"%";
    })
    //add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let parcent=(e.offsetX/e.target.getBoundingClientRect().width)*100 ;
        document.querySelector(".circle").style.left = parcent +"%";
        currentsong.currentTime= ((currentsong.duration)*parcent)/100
    })
    //add an eventlisteiner for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    //add an eventlisteiner for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })
    
    //ad an event for volumn
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log(e,e.target,e.target.value)
        currentsong.volume=parseInt(e.target.value)/100
    })
    //add eventlisteiner to mute this track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
           currentsong.volume=0;
           document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src= e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
    
}
main()
