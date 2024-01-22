import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    classes: {
        root: string
    }
}


export const Container: React.FunctionComponent<ContainerProps> = (props) => {
    return (<div className={props.classes.root}>{props.children}</div>);
}
