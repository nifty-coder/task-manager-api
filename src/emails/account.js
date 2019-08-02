const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.API);

const sendWelcomeEmail = (name, email) => {
     sgMail.send({
		to: email,
		from: 'surya.kasibhatla@gmail.com',
		subject: 'Subscription of Sakets Task App - Welcome',
		text: `Welcome to the app, ${name}! Track your day to day todo lists! This app can be used by everyone! For more help or feedback reply to this email. Thanks, Saket`,
	 });
	console.log('sent welcome e-mail!');
};
const sendCancellationEmail = (name, email) => {
     sgMail.send({
		to: email,
		from: 'surya.kasibhatla@gmail.com',
		subject: 'Cancellation of Sakets Task App - Goodbye',
		text: `Goodbye, ${name}! Sorry to see you go! Is there any thing we could do to improve your experience? Please fill this form below: https://docs.google.com/forms/d/e/1FAIpQLScHgGm2X-2nFUpnsNjLxHsQVzZ2MqmM4SS8xF0vLQZXGEdP1Q/viewform. Thanks, Saket`
	 });
	console.log('sent cancellation e-mail!');
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail 
};