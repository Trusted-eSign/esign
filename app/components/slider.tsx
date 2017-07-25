import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from "react-router";
import { get_Certificates, lang, video_app, VideoApp } from "../module/global_app";
import { BlockNotElements, CertInfo } from "./certificate";
import MainWindow from "./MainWindow";
import MainWindowOperation from "./MainWindowOperation";
import MainWindowWorkSpace from "./MainWindowWorkSpace";
//declare let $: any;

interface ISliderProps {
    router: any;
}
export class Slider extends React.Component<ISliderProps, any> {
    constructor(props: ISliderProps) {
        super(props);
        this.state = ({ slider: true });
    }
    componentDidMount() {
        $(".slider").slider({ interval: 100000000 });
        $(".slider").slider("pause");
    }
    prevSlide() {
        $(".slider").slider("prev");
        this.setState({ slider: !this.state.slider });
    }
    nextSlide() {
        $(".slider").slider("next");
        this.setState({ slider: !this.state.slider });
    }
    render() {
        let self = this;
        let slider = "slider-white";
        let btn = "slider-btn-white";
        if (this.state.slider) {
            btn = "slider-btn-red";
            slider = "slider-red";
        }
        return (
            <div className="slider-content">
                {
                    // <div className={slider + " slider fullscreen"}>
                    //     <ul className="slides">
                    //         <li>
                    //             <MainWindowWorkSpace/>
                    //         </li>
                    //         <li>
                    //             <VideoSlide/>
                    //         </li>}
                    //     </ul>
                    //     <a className="waves-effect slider-btn-prev" onClick={this.prevSlide.bind(this) }>
                    //         <i className={"material-icons " + btn}>keyboard_arrow_left</i>
                    //     </a>
                    //     <a className="waves-effect slider-btn-next"  onClick={this.nextSlide.bind(this) }>
                    //         <i className={"material-icons " + btn}>keyboard_arrow_right</i>
                    //     </a>
                    //     <div className="enabled-indicators"/>
                    // </div>
                    <MainWindowWorkSpace />
                }
            </div>
        );
    }
}
