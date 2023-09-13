import RingLoader from 'react-spinners/RingLoader';

export default function Spinner(props)
{
        const spinner = {
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100px",
                height: "100px",
                marginTop: "-50px", /*set to a negative number 1/2 of your height*/
                marginLeft: "-50px" /*set to a negative number 1/2 of your width*/
        };

        return (<RingLoader color='green' size={100} loading={props.loading} cssOverride={spinner}/>);
}