import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  cards: any = [];
  selectedcard: any = [];
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
  successmsg: boolean = false;

  @ViewChild('imageurl') imageurl: ElementRef;
  @ViewChild('closeBtn') closeBtn: ElementRef;
 
  constructor(private modalService: NgbModal, private http: HttpClient, private fb: FormBuilder) {
    /* Add Card Form Validation */
    this.cardForm = this.fb.group({
      name: ['', Validators.required],
      imageurl: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.showCards();
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

  /*Preview Preview Uploaded Image */
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
    this.modalService.open(contentadd, { size: 'sm' });
    this.successmsg = false;
    this.default_img = "assets/images/default.jpg";
    this.cardForm.reset();
  }

  /* Add Card */
  addCard(cardFormValue) {
    console.log(cardFormValue);
    this.loading = true;
    this.successmsg = false;
    console.log(cardFormValue.name, cardFormValue.imageurl.name);
    this.http.post(this.url, {
      name: cardFormValue.name,
      image_url: this.default_img
    }).subscribe((data: any) => {
      this.showCards();
    });
    setTimeout(() => {
      this.loading = false;
      this.successmsg = true;
    }, 1000);
  }

  /* Card Selected to Update*/
  getSelectedCard(id, content) {
    this.successmsg = false;
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
    this.modalService.open(content);
    this.successmsg = false;
    this.default_img = "assets/images/default.jpg";
  }

  /* Update Card */
  updateCard(updateFormValue) {
    this.http.put(this.url + updateFormValue.id, {
      name: updateFormValue.name,
      image_url: this.default_img
    }).subscribe((data: any) => {
      this.successmsg = true;
      this.showCards();
    });
  }

  /* Delete Card */
  deleteCard(id, name) {
      return this.http.delete(this.url + id).subscribe((data: any[]) => {
        this.showCards();
      });
  }
}