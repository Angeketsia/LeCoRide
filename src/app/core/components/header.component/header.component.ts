import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header-component',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private translate: TranslateService) {

    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('fr');
  }

 switchLanguage(event: any) { 
  this.translate.use(event.value);
  }


}
