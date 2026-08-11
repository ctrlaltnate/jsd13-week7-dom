

const pokeDiv = document.querySelector("#pokedex");
const findBtn = document.querySelector("#btn-find-pokemon");
const poke_url = 'https://pokeapi.co/api/v2/pokemon/';

// กำหนด style ของปุ่มด้วย JavaScript
Object.assign(findBtn.style, {
        padding: '10px 20px',
        fontSize: '1em',
        cursor: 'pointer',
        border: '0',
        borderRadius: '32px',
        backgroundColor: 'brown',
        color: '#fff',
        margin: '14px 0px',
        boxShadow: '0 4px 12px brown'
});

findBtn.addEventListener('click', () => {
    findPokemon();
})

async function findPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    const newRandomPokemon = await fetch(poke_url + randomId);
    const responsePokemon = await newRandomPokemon.json();
    console.log(responsePokemon);



    const div = document.createElement('div');
    const img = document.createElement('img');

    const ID = document.createElement('h2');
    const name = document.createElement('p');
    const type = document.createElement('p');

    const cryAudio = document.createElement('audio');


    findBtn.addEventListener('click', () => {
        div.remove();
    })

    Object.assign(ID.style, {
        color: '#fff',
        fontSize: '1.5em',
        margin: '0',
        padding: '0'
    });

    document.querySelector('body').style.backgroundColor = '#464646';    

    Object.assign(name.style, {
        color: '#fff',
        fontSize: '2em',
        margin: '0 0 16px 0',
        padding: '0',
        overflowWrap: 'break-word',
        wordBreak: 'break-word'
    });

   

    Object.assign(type.style,{
        border:'0',
        borderRadius:'32px'
    })

    let colorType ='';
    /******************************************/
    switch (responsePokemon.types[0].type.name) {
        case 'normal':
            colorType = '#A8A77A';
            break;
        case 'fire':
            colorType = '#EE8130';
            break;
        case 'water':
            colorType = '#6390F0';
            break;
        case 'electric':
            colorType = '#F7D02C';
            break;
        case 'grass':
            colorType = '#7AC74C';
            break;
        case 'ice':
            colorType = '#96D9D6';
            break;
        case 'fighting':
            colorType = '#C22E28';
            break;
        case 'poison':
            colorType = '#A33EA1';
            break;
        case 'ground':
            colorType = '#E2BF65';
            break;
        case 'flying':
            colorType = '#A98FF3';
            break;
        case 'psychic':
            colorType = '#F95587';
            break;
        case 'bug':
            colorType = '#A6B91A';
            break;
        case 'rock':
            colorType = '#584d16';
            break;
        case 'ghost':
            colorType = '#735797';
            break;
        case 'dragon':
            colorType = '#6F35FC';
            break;
        case 'dark':
            colorType = '#1d1917';
            break;
        case 'steel':
            colorType = '#B7B7CE';
            break;
        case 'fairy':
            colorType = '#D685AD';
            break;
        default:
            colorType = '#777777';
    }
    Object.assign(div.style, {
        color: '#fff',
        margin: '8px',
        padding: '16px 32px',
        boxShadow: `0 8px 14px color-mix(in srgb, ${colorType} 40%, black)`,
        backgroundColor:colorType,
        borderRadius: '32px',
    });
    /*****************************************/

    cryAudio.src = responsePokemon.cries.latest;
    cryAudio.volume = 0.2;
    cryAudio.controls = true;
    cryAudio.play();


    img.src = responsePokemon.sprites.front_default;
    img.width = 200;
    img.height = 200;

    ID.textContent = "#" + randomId;

    const rawName = responsePokemon.name;
    const CapitalizeName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
    name.textContent = CapitalizeName;

    type.textContent = "Type : " +responsePokemon.types[0].type.name;

    div.append(img);
    div.append(ID);
    div.append(type);
    div.append(name);
    div.append(cryAudio);
    div.classList.add(CapitalizeName);

    console.log("Class : " + div.getAttribute('class') + " ---- is Assigned")
    pokeDiv.append(div);
}
