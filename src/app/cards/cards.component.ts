import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  cards: any = [];
  name: string;
  image_url: string;
  closeResult: string;
  id: number;
  url = "http://localhost:3000/cards/";
  selectedCard: any[];
  default_img: string = "assets/images/default.jpg";
  fileToUpload: File = null;
  cardForm: FormGroup;
  updateForm: FormGroup;
  loading: boolean = false;
  modalReference: NgbModalRef;

  @ViewChild('imageurl') imageurl: ElementRef;
 
  private success = new Subject<string>();
  staticAlertClosed = false;
  successMessage: string;
  alertname: string;

  constructor(private modalService: NgbModal, private http: HttpClient, private fb: FormBuilder) {
    /* Add Card Form Validation */
    this.cardForm = this.fb.group({
      name: ['', Validators.required],
      imageurl: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.showCards();

    /* Modal close setting */
    setTimeout(() => this.staticAlertClosed = true, 9000);
    this.success.subscribe((message) => this.successMessage = message);
    this.success.pipe(
      debounceTime(6000)
    ).subscribe(() => this.successMessage = null);
  }

  /* Get cards to show */
  showCards() {
    return this.http.get(this.url)
      .subscribe(data => {
        this.cards = data;
        this.cards.forEach(element => {
          this.name = element.name;
          this.image_url = element.image_url;
        });
      });
  }

  /*Preview Uploaded Image */
  handleFileInput(event, file: FileList) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      this.cardForm.get('imageurl').setValue(file);
    }
    this.fileToUpload = file.item(0);
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.default_img = event.target.result;
    }
    reader.readAsDataURL(this.fileToUpload);
  }

  /* Add Card Pop Up */
  openSm(contentadd) {
    this.modalReference = this.modalService.open(contentadd, { size: 'sm' });
    this.modalReference.result.then((result) => {
      this.closeResult = 'Closed with: ${result}';
    }, (reason) => {
      this.closeResult = 'Dismissed ${this.getDismissReason(reason)}';
    });
    this.default_img = "assets/images/default.jpg";
    this.cardForm.reset();
  }

  /* Add Card */
  addCard(cardFormValue) {
    this.loading = true;
    this.http.post(this.url, {
      name: cardFormValue.name,
      image_url: this.default_img
    }).subscribe((data: any) => {
      this.loading = false;
      this.closeModal();     
      this.alertname = cardFormValue.name;
      const addSuccess = "added";
      this.success.next(addSuccess);
      this.scrolltop();
      this.showCards();
    });
  }

  /* Card Selected to Update*/
  getSelectedCard(id, content) {
    this.open(content);
    this.id = id;
    const params = new HttpParams().set('id', id);
    this.http.get(this.url, { params: { id } }).subscribe((data: any[]) => {
      this.selectedCard = data;
      this.selectedCard
        .forEach(element => {
          this.updateForm = this.fb.group({
            id: element.id,
            name: [element.name, Validators.required],
            image_url: [element.image_url, Validators.required],
          });
        });
    });
  }

  /* Update Card Pop Up */
  open(content) {
    this.modalReference = this.modalService.open(content);
    this.modalReference.result.then((result) => {
      this.closeResult = 'Closed with: ${result}';
    }, (reason) => {
      this.closeResult = 'Dismissed ${this.getDismissReason(reason)}';
    });
    this.default_img = "assets/images/default.jpg";
  }

  /* Update Card */
  updateCard(updateFormValue) {
    this.http.put(this.url + updateFormValue.id, {
      name: updateFormValue.name,
      image_url: this.default_img
    }).subscribe((data: any) => {
      this.closeModal();
      this.alertname = updateFormValue.name;
      const updateSuccess = "updated";
      this.success.next(updateSuccess);
      this.scrolltop();
      this.showCards();
    });
  }

  /* Delete Card */
  deleteCard(id, name) {
    return this.http.delete(this.url + id).subscribe((data: any[]) => {
      this.closeModal();
      this.alertname = name;
      const deleteSuccess = "deleted";
      this.success.next(deleteSuccess);
      this.scrolltop();
      this.showCards();
    });
  }

  /* Close Modal */
  closeModal() {
    this.modalReference.close();
  }

  /* Scroll Top */
  scrolltop() {
    window.scroll({ top: 0, behavior: 'smooth' })
  }

}