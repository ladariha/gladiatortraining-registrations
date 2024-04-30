<?php

include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class MailService
{
  // FOLLOWING LINE MUST BE 8th LINE OF FILE FOR BUILD.SH !!!
public static $apiKey = "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";

  public static function getDefaultImage(
  ) {
    return "https://gladiatortraining.cz/wp-content/uploads/2022/03/VLAJKA.png";
  }

  public static function getStyle()
  {

    return <<<HTML
    <style>
    .email {
      color: #666;
      font-family: Open Sans, Arial, sans-serif
    }

    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;300&display=swap');

    .email h2,
    .email h3,
    .email h4,
    .email strong {
      color: #333
    }

    .email h2,
    .email h3,
    .email h4 {
      font-family: 'Oswald', Helvetica, Arial, Lucida, sans-serif;
      text-transform: uppercase;
    }

    .email h3 {
      font-size: 16px;
    }

    .email-header h2 {
      font-weight: 300;
      font-size: 30px;
      letter-spacing: 5px;
      line-height: 1.4em;
    }

    .email-header {
      display: flex;
      margin: 30px auto;
    }

    .email-header img {
      max-width: 10vw;
      min-width: 25rem;
    }

    .email-header .text {
      flex: 0 0 50%;
      flex-grow: 11111;
      text-align: center;
      width: 100%;
    }

    .email .payment {
      display: flex;
      justify-content: center;
    }

    .email .qr {
      margin-left: 1em;
      text-align: left;
    }

    .section-header {
      text-align: center;
    }

    .payment-left {
      text-align: right;
    }

    .email table.regs {
      background-color: #fff;
      border-collapse: collapse;
      border-spacing: 0;
      border-width: 2px;
      border-color: #666666;
      border-style: solid;
      border: 1px solid #eee;
      margin: 0 0 15px;
      text-align: left;
      width: 100%;
    }

    .email table.regs thead th {
      background: #f8f9fa;
      border: solid #dee2e6;
      border-width: 0 0 1px;
      text-align: left;
      transition: box-shadow .2s;
      color: #555;
      font-weight: 700;
      padding: 9px 24px;
    }

    .email .regs td {
      border-top: 1px solid #eee;
      padding: 6px 24px;
      border: solid #dee2e6;
      border-width: 0 0 1px;
      text-align: left;
    }
  </style>
  HTML;
  }

  public static function getMembersTable($registrations)
  {
    $rows = "";
    foreach ($registrations as $reg) {
      $date = new DateTime('now', new DateTimeZone('Europe/Prague'));
      $date->setTimestamp(round($reg->date_of_birth / 1000));

      $formatter = new IntlDateFormatter(
        "cs_CZ.utf8",
        // the locale to use, e.g. 'en_GB'
        IntlDateFormatter::SHORT,
        // how the date should be formatted, e.g. IntlDateFormatter::FULL
        IntlDateFormatter::NONE,
        // how the time should be formatted, e.g. IntlDateFormatter::FULL
        'Europe/Prague' // the time should be returned in which timezone?
      );
      $dob = $formatter->format($date);


      $row = <<<HTML
 <tr>
            <td>{$reg->name}</td>
            <td>{$reg->last_name}</td>
            <td>{$reg->registration_type_name}</td>
            <td>{$reg->club}</td>
            <td>{$dob}</td>
          </tr>

HTML;
      $rows .= $row;
    }

    return $rows;
  }

  public static function sendEmail($toName, $toEmail, $subject, $htmlMessage)
  {
    global $API_KEY;

    $fromName = 'Gladiator Training';
    $fromEmail = 'info@gladiatortraining.cz';
    $style = MailService::getStyle();

    $data = array(
      "sender" => array(
        "email" => $fromEmail,
        "name" => $fromName
      ),
      "to" => array(
        array(
          "email" => $toEmail,
          "name" => $toName
        )
      ),
      "subject" => $subject,
      "htmlContent" => '<html><head>' . $style . '</head><body>' . $htmlMessage . '</body></html>'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.brevo.com/v3/smtp/email');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLINFO_HEADER_OUT, true);

    $headers = array(
      'accept: application/json',
      'api-Key: ' . MailService::$apiKey,
      'Content-Type: application/json',
      'Expect:'
    );

    ErrorsUtils::log(json_encode($headers));

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $info = curl_getinfo($ch);

    $result = curl_exec($ch);
    curl_close($ch);
  }

  public static function getPaymentConfirmationTemplate($image, $eventName)
  {

    return <<<HTML
    <div class="email">
    <div class="email-header">
      <div class="text">
      <div><img src="{$image}"/></div>
        <h2>Gladiator Challenge: {$eventName}</h2>
        <h3>Děkujeme, Vaše platba za registraci byla přijata.</h3>
      </div>
    </div>

  </div>



HTML;


  }



  public static function getNewRegistrationTemplate($prefix, $accountNumber, $bankCode, $image, $eventName, $iban, $price, $fullAccountNumber, $variableSymbol, $swift, $message, $registrations)
  {
    $membersTable = MailService::getMembersTable($registrations);
    return <<<HTML
    <div class="email">
    <div class="email-header">
      <div class="text">
      <div><img src="{$image}"/></div>
        <h2>Gladiator Challenge: {$eventName}</h2>
        <h3>Děkujeme, Vaše registrace byla potvrzena.</h3>
        <span>Nyní, prosím, uhraďte bezhotovostním převodem Vaše startovné</span>
      </div>
    </div>
    <h2 class="section-header">Platební údaje</h2>
    <div >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tbody>
        <tr>
          <td align="center" style="width: 50%;">
          <div class="payment-left">
        <ul style="list-style: none;">
          <li><strong>Bankovní účet č.</strong>&nbsp;{$fullAccountNumber}</li>
          <li><strong>Částka</strong>&nbsp;{$price} CZK</li>
          <li><strong>Variabilní symbol</strong>&nbsp;{$variableSymbol}</li>
          <li><strong>Zpráva pro příjemce</strong>&nbsp;{$message}</li>
          <li><strong>IBAN</strong>&nbsp;{$iban}</li>
          <li><strong>BIC/SWIFT</strong>&nbsp;{$swift}</li>
        </ul>
      </div>
    </td>
          <td align="center" style="width: 50%;">
          <div class="qr">
            <img src="http://api.paylibo.com/paylibo/generator/czech/image?{$prefix}accountNumber={$accountNumber}&amp;size=240&amp;bankCode={$bankCode}&amp;amount={$price}&amp;currency=CZK&amp;vs={$variableSymbol}&amp;message={$message}">
      </div></td>
        </tr>
      </tbody>
    </table>
    </div>
    <h2 class="section-header">Shrnutí registrace</h2>
    <div>
      <table class="regs">
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Příjmení</th>
            <th>Typ registrace</th>
            <th>Tým</th>
            <th>Datum narození</th>
          </tr>
        </thead>
        <tbody>
          {$membersTable}
        </tbody>
      </table>
    </div>
  </div>



HTML;

  }


  public static function sendNewRegistration($event, $leaderId, $leaderName, $leaderLastName, $leaderEmail, $registrations)
  {
    $prefix = $event->prefix ? $event->prefix . "-" : "";
    $fullAccountNumber = $prefix . $event->account_number . "/" . $event->bank_code;

    $message = $leaderName . " " . $leaderLastName;
    $variableSymbol = str_pad(strval($event->id), 3, "0", STR_PAD_LEFT);
    $variableSymbol .= str_pad(strval($leaderId), 7, "0", STR_PAD_LEFT);
    $image = $event->image && strlen($event->image) > 1 ? $event->image : MailService::getDefaultImage();
    // $prefix, $accountNumber, $bankCode,
    $rawPrefix = $event->prefix ? "accountPrefix=" . $event->prefix . "&amp;" : "";


    $email = MailService::getNewRegistrationTemplate($rawPrefix, $event->account_number, $event->bank_code, $image, $event->name, $event->iban, $registrations[0]->price, $fullAccountNumber, $variableSymbol, $event->swift, $message, $registrations);
    ErrorsUtils::log("about to send to " . $email);
    MailService::sendEmail($message, $leaderEmail, $event->name . " - potvrzení registrace", $email);
  }
  public static function sendPaidConfirmation($event, $leaderName, $leaderLastName, $leaderEmail)
  {

    $message = $leaderName . " " . $leaderLastName;
    $image = $event->image && strlen($event->image) > 1 ? $event->image : MailService::getDefaultImage();
    ErrorsUtils::log("about to send to " . $message);
    ErrorsUtils::log("about to send to - " . $leaderEmail);
    $email = MailService::getPaymentConfirmationTemplate($image, $event->name);
    MailService::sendEmail($message, $leaderEmail, $event->name . " - platba přijata", $email);
  }
}
