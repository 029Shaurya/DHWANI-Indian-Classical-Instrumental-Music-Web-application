let currentSong = new Audio();
let songs = [];
let currFolder;

function setFavicon(url) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
}

function convertSeconds(seconds) {
    if(seconds <= 0 || isNaN(seconds)){
        return "00:00";
    }
    const wholeSeconds = Math.floor(seconds); // Convert to whole seconds
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;

    // Pad with leading zeros if necessary
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){

    currFolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let a_s = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < a_s.length; index++) {
        const element = a_s[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

     // show all songs in "Your Library"
     let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
     songUL.innerHTML = ""
     for (const song of songs) {
         songUL.innerHTML += `<li>  <img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div>${decodeURI(song)}</div>
                                 <div>Shreya Ghoshal</div>
                             </div>
                             <div class="playnow">                                
                                 <img class="invert playButton" src="/img/play.svg" alt="">
                             </div> </li>`;
     }
 
     // Attach an event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click", element=>{
             // console.log(e.querySelector(".info").firstElementChild.innerHTML)
             playMusic(e.querySelector(".info").firstElementChild.innerHTML)
         })
     })

}

const playMusic = (song, pause = false)=>{
    let temp = decodeURI(song);    
    song = `/${currFolder}/` + decodeURI(song);
    currentSong.src = song;
    if(!pause){
        currentSong.play();
        play.src = "img/pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = temp;
    document.querySelector(".songtime1").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")


    
    let arr = Array.from(anchors);
    for (let index = 0; index < arr.length; index++){
        const e = arr[index];
        if(e.href.includes("/songs") && !e.href.includes("/songs/.DS_Store") && !e.href.includes(".htaccess")){
            folder = String(e).split("/").slice(-2)[0];
            // Get the meta data of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.text();
            console.log(typeof response)
            response = JSON.parse(response)
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play"> 
                <svg class="playSvg" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                    <!-- Green circular background -->
                    <circle cx="12" cy="12" r="12" fill="#438910" />
                    <!-- Play button triangle -->
                    <polygon points="10,8 16,12 10,16" fill="white" />
                </svg>
                             
            </div>
            <img class="thumbnail" src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }
    // load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            document.querySelector(".playbar").style.display = "block";
        })
    })

}

async function main(){

    setFavicon('../img/logo.jpg');

    // await getSongs("songs/A_mix");
    // playMusic(songs[0], true);
    
    // display all albums on page
    displayAlbums();

   
    // Attach an event listener to play next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(convertSeconds(currentSong.currentTime), convertSeconds(currentSong.duration))
        document.querySelector(".songtime1").innerHTML = `${convertSeconds(currentSong.currentTime)}`
        document.querySelector(".songtime1").innerHTML += ` / ${convertSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 - 1 + "%";
        
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        document.querySelector(".circle").style.left = ((e.offsetX / e.target.getBoundingClientRect().width))*100 + "%";
        currentSong.currentTime = currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width);
    })

    // Add an eventlistner for Hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    // Add event listener for close icon
    document.querySelector(".closeIcon").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-200%";
    })

    //  Add an eventlistener to prev and next
    prev.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index > 0)
            playMusic(songs[index -1]);
        else 
            playMusic(songs[songs.length - 1]);
    });

    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index < songs.length - 1)
            playMusic(songs[index + 1]);
        else 
            playMusic(songs[0]);
        
    }) 

    // Add an event to volumeSlider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        // console.log(e);
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add eventlistener to mute the track
    document.querySelector(".volumeIcon").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .25;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 25;
        }
    })

    

    // play the first song
    // var audio = new Audio(songs[3]);
    // audio.play();
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(duration);
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    //   });
}
main()