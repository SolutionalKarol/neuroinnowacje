# Formularz kontaktowy — OVH

Wgrać razem: `api/contact.php`, `assets/contact.js`, `assets/contact.css`, `assets/kiszlo-studio.png` i `index.html`.

Wymagania: PHP 7.4+, sesje PHP, zapisywalny katalog tymczasowy i działająca funkcja mail() na OVH. Odbiorca jest stały: kontakt@ncni.pl. Nadawca techniczny: kontakt@ncni.pl; przed publikacją należy potwierdzić jego dopuszczenie w konfiguracji poczty OVH i ustawienia SPF/DKIM. E-mail odwiedzającego trafia wyłącznie do Reply-To.

Przed uruchomieniem: sprawdzić składnię PHP, odpowiedź GET z tokenem, poprawny POST z tej samej domeny, odbiór testowej wiadomości w skrzynce (także Spam), odpowiedź na adres odwiedzającego, komunikaty błędów i limit wysyłki. Sukces mail() oznacza przyjęcie przez serwer pocztowy, nie potwierdza dostarczenia.

Nie wykonano testu dostarczenia na OVH. Lokalny serwer statyczny nie obsługuje PHP i formularz pokaże błąd zamiast pozornego potwierdzenia wysłania. Treści wiadomości nie są zapisywane w logach aplikacji ani wysyłane do analityki. Mechanizm limitu przechowuje w katalogu tymczasowym jedynie czasy prób w pliku nazwanym skrótem adresu IP; warto uwzględnić te pliki w okresowym sprzątaniu katalogu tymczasowego hostingu.
