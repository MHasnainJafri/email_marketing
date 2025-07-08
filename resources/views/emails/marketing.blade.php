<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      padding: 20px 0;
      background-color: #f6f6f6;
    }
    .email-content {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 0 5px rgba(0,0,0,0.05);
    }
    .email-header {
      background-color: #F3525A;
      padding: 20px;
      text-align: center;
    }
    .email-header img {
      max-height: 60px;
    }
    .email-body {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h1 {
      color: #F3525A;
      margin-bottom: 20px;
    }
    .email-footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 20px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #F3525A;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>

<div class="email-wrapper">
  <div class="email-content">

    <!-- Logo/Header -->
    <div class="email-header">
      <img src="{{ env('APP_URL') }}/logo.png" alt="FinGov">
    </div>

    <!-- Body -->
    <div class="email-body">
     {!! $body !!}
    </div>

    <!-- Footer -->
    <div class="email-footer">
     <p class="m-0">© <a class="text-secondary border-bottom" href="#">2025 | Fingov.co.uk</a>. All Rights Reserved. </p>
    </div>

  </div>
</div>

</body>
</html>
