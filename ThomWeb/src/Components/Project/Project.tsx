import { useParams } from 'react-router-dom';

import projectData from '../../Assets/content.json';
import ErrorPage from '../../Pages/ErrorPage/ErrorPage';
import styles from './Project.module.css';

export interface IProject {
    title?: string,
    description?: string[],
    github?: string,
    imagePaths?: string[],
    id?: string
}

export default function Project() {
    const { id } = useParams();
    const project = projectData.content.find(p => p.id === id)
    
    function GetDescription() {
        return project?.description?.map(section => 
            <p> 
                { section } 
            </p>
        )
    }

    function GetImages(){
        return project?.imagePaths.map((path, idx) => {
            console.log(path)
            return (
                <img
                    className={styles.image}
                    src={process.env.PUBLIC_URL + `/${path}`}
                    alt={project.title + `-${idx}`}
                >
                </img>
            )
        })
    }

    const handleRedirect = () => {
        window.open(project?.github, "_blank")
    }

    return (
        project ? (
            <div className={styles.container}>
                <h1 className={styles.header} onClick={handleRedirect}>{project?.title}</h1>
                <div className={styles.body}>
                    {GetDescription()}
                </div>
                {GetImages()}
            </div>  
        )
        : <ErrorPage/>
    );
}