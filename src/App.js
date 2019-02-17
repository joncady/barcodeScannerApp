import React, { Component } from 'react';
import Quagga from 'quagga';
import axios from 'axios';
import { Modal, ModalHeader, Button } from 'reactstrap';
import 'firebase/firestore';
import firebase from 'firebase';

class App extends Component {

	constructor() {
		super();
		this.state = {
			codeDetected: false,
			modal: false,
			modalMessage: '',
			modalTitle: '',
			modalPic: null,
			success: false
		}
	}

	componentDidMount() {
		Quagga.init({
			inputStream: {
				name: "Live",
				type: "LiveStream",
				target: document.querySelector('#barcode')    // Or '#yourElement' (optional)
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
		let db = firebase.firestore().collection('fridge-items');
		this.setState({
			dbRef: db
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
			axios.get('https://duetwithme.herokuapp.com/code', {
				params: {
					code: data
				}
			})
				.then((response) => {
					try {
						let data = response.data.items[0];
						let title = data.title;
						let desc = data.description;
						this.setState({
							modal: true,
							modalTitle: title,
							modalMessage: desc,
							codeDetected: false,
							success: true
						});
					} catch (err) {
						this.setState({
							modal: true,
							modalTitle: "Error!",
							modalMessage: "Please try again!",
							codeDetected: false,
							success: false
						})
					}
				});
		});
	}

	addItem = () => {
		const { dbRef, modalTitle } = this.state;
		dbRef.add({
			name: modalTitle
		})
		.then(() => {
			this.setState({
				success: false,
				modal: false
			});
		})
	}

	render() {
		return (
			<div className="App" id="barcode">
				<Modal style={{ padding: '1rem' }} isOpen={this.state.modal} toggle={this.toggle}>
					<ModalHeader toggle={this.toggle}>{this.state.modalTitle}</ModalHeader>
					{this.state.modalPic && <img src={this.state.modalPic} alt="Item"></img>}
					<div>
						<div dangerouslySetInnerHTML={{ __html: this.state.modalMessage }}>
						</div>
					</div>
					{this.state.success && <Button onClick={this.addItem}>Add Item</Button>}
				</Modal>
			</div>
		);
	}
}

export default App;
