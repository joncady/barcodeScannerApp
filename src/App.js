import React, { Component } from 'react';
import Quagga from 'quagga';
import axios from 'axios';
import { Modal, ModalHeader } from 'reactstrap';

class App extends Component {

	constructor() {
		super();
		this.state = {
			codeDetected: false,
			modal: false,
			modalMessage: '',
			modalTitle: '',
			modalPic: null
		}
	}

	componentDidMount() {
		Quagga.init({
			inputStream: {
				name: "Live",
				type: "LiveStream",
				target: document.querySelector('#yourElement')    // Or '#yourElement' (optional)
			},
			decoder: {
				readers: ["code_128_reader", "upc_reader", "upc_e_reader"],
				debug: {
					drawBoundingBox: true
				}
			}
		}, function (err) {
			if (err) {
				console.log(err);
				return
			}
			console.log("Initialization finished. Ready to start");
			Quagga.start();
		});
		Quagga.onDetected((data) => {
			if (!this.state.codeDetected) {
				this.setCode(data.codeResult.code);
			}
		});
	}

	toggle = () => {
		this.setState(prevState => ({
			modal: !prevState.modal
		}));
	}

	setCode(data) {
		this.setState({
			codeDetected: true
		}, () => {
			axios.get('http://localhost:3030/code', {
				params: {
					code: data
				}
			})
				.then((response) => {
					let data = response.data.items[0];
					console.log(data);
					let title = data.title;
					let desc = data.description;
					this.setState({
						modal: true,
						modalTitle: title,
						modalMessage: desc
					});
				});
		});
	}

	render() {
		return (
			<div className="App" id="yourElement">
				<Modal isOpen={this.state.modal} toggle={this.toggle}>
					<ModalHeader toggle={this.toggle}>{this.state.modalTitle}</ModalHeader>
					{this.state.modalPic && <img src={this.state.modalPic} alt="Item"></img>}
					<div>
						<div dangerouslySetInnerHTML={{ __html: this.state.modalMessage }}>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}

export default App;
