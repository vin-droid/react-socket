import React from 'react';
import { render } from 'react-dom';
import { Header } from './header/index';
import { Footer } from './footer/index';

export class Root extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div>
                <Header />
                {this.props.children}
                <Footer />
            </div>
        );
    }
}
