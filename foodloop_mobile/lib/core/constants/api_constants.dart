class ApiConstants {

  //enulator url
  // static const String baseUrl = 'http://10.0.2.2:5000/api';



  static const String baseUrl = 'http://192.168.123.198:5000/api';


//auth urls
  static const String baseAuthUrl = '$baseUrl/auth';
  static const String login = '$baseAuthUrl/login';
  static const String signUp = '$baseAuthUrl/signup';

// user urls
  static const String user = '$baseUrl/user';
  static const String userProfile = '$user/profile';


// donation urls
  static const String donationBaseUrl = '$baseUrl/donations';
  static const String createDonation = '$donationBaseUrl/create';
  static const String listDonations = '$donationBaseUrl/list';
  static const String myDonations = '$donationBaseUrl/my';

  static const String impactUrl = '$baseUrl/impact';

  static const String joyLoopUrl = '$baseUrl/joy';

}

