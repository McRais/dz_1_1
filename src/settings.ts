import express, {Request, Response} from "express";

export const app = express()
app.use(express.json())

type RequestWithParams<P> = Request<P, {}, {}, {}>;
type RequestWithBody<B> = Request<{}, {}, B, {}>
type RequestWithBodyAndParams<P,B> = Request<P, {}, B, {}>

function resolutionValidator(array:any) {
    return array.length !== new Set(array).size;
}
function isIsoDate(str:string) {                                        // validate the Date
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    const d = new Date(str);
    return d instanceof Date && !isNaN(d.getTime()) && d.toISOString()===str;
}

 type VideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number|null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: AvailableResolutions[] | null
}

enum AvailableResolutions{
    P144 = 'P144',
    P240 = 'P240',
    P360 = 'P360',
    P480 = 'P480',
    P720 = 'P720',
    P1080 = 'P1080',
    P1440 = 'P1440',
    P2160 = 'P2160'
}


//videos.length = 0

const videos: VideoType[]= [
    {
        "id": 0,
        "title": "string",
        "author": "string",
        "canBeDownloaded": true,
        "minAgeRestriction": null,
        "createdAt": "2023-07-17T15:50:37.381Z",
        "publicationDate": "2023-07-17T15:50:37.381Z",
        "availableResolutions": [
            AvailableResolutions.P144, AvailableResolutions.P240, AvailableResolutions.P360, AvailableResolutions.P1440, AvailableResolutions.P2160
        ]
    },
    {
        "id": 1,
        "title": "something",
        "author": "string",
        "canBeDownloaded": true,
        "minAgeRestriction": null,
        "createdAt": "2023-07-17T15:50:37.381Z",
        "publicationDate": "2023-07-17T15:50:37.381Z",
        "availableResolutions": [
            AvailableResolutions.P1080, AvailableResolutions.P720, AvailableResolutions.P480
        ]
    }
]

//testing, delete all videos
app.delete('/testing/all-data', (req: Request, res: Response) => {
    videos.length = 0
    res.sendStatus(204)
})
//testing end

//1 point, get all videos
app.get('/videos', (req, res) :void => {
    res.send(videos);
})
//1 point end

// 3 point, get video by ID
app.get('/videos/:id', (req: RequestWithParams<{id: number}>, res: Response)  => {
    const id = +req.params.id;

    const video  = videos.find((video)  => video.id === id);

    if (!video){
        res.sendStatus(404)
        return
    }

    res.status(200).send(video)
})
//3 point end

//2 point, post a video
type ErrorMessageType = {
    message: string;
    field: string
}

type ErrorType ={errorsMessages: ErrorMessageType[]}

app.post('/videos', (req: RequestWithBody<{
    title: string,
    author: string,
    availableResolutions: AvailableResolutions[]
}>, res: Response) =>{
    let errors: ErrorType = {errorsMessages: []}
    let title = req.body.title, author = req.body.author, availableResolutions = req.body.availableResolutions

    if (!title || !title.length || title.trim().length > 40){
        errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
    }

    if (!author || !author.length || author.trim().length > 20){
        errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
    }

    if (!availableResolutions || !availableResolutions.length || Array.isArray(availableResolutions) === false || resolutionValidator(availableResolutions)) {
        errors.errorsMessages.push({message: 'There is no resolutions entered or there is 2 resolutions with the same name', field: 'availableResolutions'})
    } else {
        for (let i = 0; i < availableResolutions.length; i++) {
            if (!Object.values(AvailableResolutions).includes(availableResolutions[i])){
                errors.errorsMessages.push({message: 'There is no such resolution', field: 'availableResolutions'})
            }
        }
    }

    if (errors.errorsMessages.length){
        res.status(400).send(errors)
        return
    }

    const createdAt : Date = new Date()
    const publicationDate: Date = new Date()

    publicationDate.setDate(createdAt.getDate() + 1)

    const newVideo: VideoType = {
        id: +(new Date()),
        title: title,
        author: author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate:publicationDate.toISOString(),
        availableResolutions: availableResolutions
    }

    videos.push(newVideo)

    res.status(201).send(newVideo)
})

//2 point end

//5 point, delete a video by id
app.delete('/videos/:id', (req: RequestWithParams<{id: number}>, res: Response) => {
    const  id = +req.params.id
    const video  = videos.find((video)  => video.id === id);
    if (!video){
        res.sendStatus(404)
        return
    }

    const index = videos.findIndex(video => video.id === id);
    if (index !== -1) {
        videos.splice(index, 1);
    }
    res.sendStatus(204)
})
//5 point end

//4 point, modify an existing video using put
app.put('/videos/:id', (req: RequestWithBodyAndParams<{id:number},{
    title: string,
    author: string,
    availableResolutions: AvailableResolutions[]
    canBeDownloaded: boolean,
    minAgeRestriction: number,
    publicationDate: string
}>, res: Response) =>{
    const  id = +req.params.id
    const video  = videos.find((video)  => video.id === id);
    if (!video){
        res.sendStatus(404)
        return
    }

    let errors: ErrorType = {errorsMessages: []}
    let {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body

    if (!title || !title.length || title.trim().length > 40){
        errors.errorsMessages.push({message: 'Impossible title change', field: 'title'})
    }
    if (!author || !author.length || author.trim().length > 20){
        errors.errorsMessages.push({message: 'Impossible author change', field: 'author'})
    }
    if (!availableResolutions||!availableResolutions.length || Array.isArray(availableResolutions) === false || resolutionValidator(availableResolutions)) {
        errors.errorsMessages.push({message: 'Impossible resolution change, there must be at least one resolution. Or there is 2 resolutions with the same name', field: 'availableResolutions'})
    } else {
        for (let i = 0; i < availableResolutions.length; i++) {
            if (!Object.values(AvailableResolutions).includes(availableResolutions[i])){
                errors.errorsMessages.push({message: 'There is no such resolution', field: 'availableResolutions'})
            }
        }
    }
    if (!minAgeRestriction|| minAgeRestriction < 1 || minAgeRestriction > 18) {
        errors.errorsMessages.push({message: 'Impossible age restriction', field: 'minAgeRestriction'})
    }
    if (!publicationDate || !isIsoDate(publicationDate)){errors.errorsMessages.push({message: 'Impossible date change', field: 'publicationDate'})}

    if (!canBeDownloaded || typeof canBeDownloaded != "boolean"){
        errors.errorsMessages.push({message: 'Impossible value', field: 'canBeDownloaded'})
    }


    if (errors.errorsMessages.length){
        res.status(400).send(errors)
        return
    }

    const index = videos.findIndex(video => video.id === id);
    if(title){
    videos[index].title = title
    }
    if(author){
        videos[index].author = author
    }
    if(availableResolutions){
        videos[index].availableResolutions = availableResolutions
    }
    if(canBeDownloaded){
        videos[index].canBeDownloaded = canBeDownloaded
    }
    if(minAgeRestriction){
        videos[index].minAgeRestriction = minAgeRestriction
    }
    if(publicationDate){
        videos[index].publicationDate = publicationDate
    }

    res.sendStatus(204)
})
//4 point end