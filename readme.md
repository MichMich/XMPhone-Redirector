##List of API calls:

###Numbers
	GET: /api/numbers

	returns
	[
		{
			id: 0,
			name: "Michael Teeuw",
			number: "0987654321",
			image: "http://....",
			redirect_since: null
		},
		{
			id: 1,
			name: "Raymond Veldhuizen",
			number: "1234567890",
			image: "http://....",
			redirect_since: "2014-09-09 05:32:00"
		},
		{
			...
		}
	]

###Redirect to
	POST: /api/redirect/{id}

On success

	{ 
		success: true,
		redirect_to: 
			{
				id: 2,
				name: 'Raymond Veldhuizen',
				number: "1234567890",
				image: "http://....",
				redirect_since: "2014-09-09 05:32:00"
			}
	}

On fail
	
	{ 
		success: false,
		code: [int]
		message: [string]
	}

###Logs

	GET: /api/logs/

	returns
	[
		{
			message: "Listening on 8080",
			time: "2014-09-23T08:10:06.253Z"
		}
	]