interface Users {
	userID : String,
	display_name : String,
	course : String,
	interests : [string],
	email : String,
	profile_picture : string,
    chats : [string]
    matchedUsers : [string],
    requestedUsers : [string],
    requestedMatches : [string]
}

interface Chat {
    id : string,
    name : string,
    lastMessage : string,
    lastMessageTime : Date,
    members : [string],
}
interface Message{
    id : string,
	senderRef : string,
	value : string,
	created_at : Date,
	read : boolean
}

export {Chat, Users, Message}