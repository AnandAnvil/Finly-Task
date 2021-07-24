
const mainComment = document.getElementById("myInput");
const commentList = document.getElementById("commentList");

let addComment = () => {
	if (!localStorage.getItem("comments")) {
		let comments = [];
		localStorage.setItem("comments", JSON.stringify(comments));
	}

	comments = JSON.parse(localStorage.getItem("comments"));
	comments.push(Object.assign(user,{
		parentCommentId: null,
		commentId: Math.random()
			.toString()
			.substr(2, 7),
		commentText: mainComment.value,
		childComments: [],
		Likes: 0
	}));
	localStorage.setItem("comments", JSON.stringify(comments));
	finalCommentsViewPage();
	mainComment.value = "";
};


let createReplyButtonCommentView = (id, operationType, commentOldData) => {

	let div = document.createElement("div");
	div.setAttribute("data-parentId", id);
	div.innerHTML = `<input type="text" value="${operationType === "update Comment" ? commentOldData : ""
		}"> <a href="#">${operationType}</a>`;

	return div;
};

let singleCommentCard = (obj, padding) => `
    <div style="background-color: antiquewhite; margin-left: ${padding}px; border: 2px solid blue; width: 400px; border-radius: 10px;" data-parentId="${obj.parentCommentId
	}" id="${obj.commentId}">
	<div class="userDetails">
	<img src="${obj.picture ? obj.picture.thumbnail : ""}" alt="Avatar" class="avatar">
	<span>${obj.name  ? obj.name.first : ""}</span>
	</div>
    ${obj.commentText}
        <a href="#">Like</a><span style="color: red"> ${obj.Likes === 0 ? "" : obj.Likes
	}</span>
        <a href="#">Reply</a><span style="color: red"> ${obj.childComments.length === 0 ? "" : obj.childComments.length
	}</span>
        <a href="#"> Edit</a>
        <a href="#"> Delete </a>
    </div>
    `;

let createRecusiveView = (commentList, padding = 0) => {
	
	let fullView = "";
	for (let i of commentList) {
		fullView += singleCommentCard(i, padding);
		if (i.childComments.length > 0) {
			fullView += createRecusiveView(i.childComments, (padding += 20));
			padding -= 20;
		}
	}
	return fullView;
};

let increaseLikeByOne = (allComments, newCommentLikeId) => {
	console.log("4")
	for (let i of allComments) {
		if (i.commentId === newCommentLikeId) {
			i.Likes += 1;
		} else if (i.childComments.length > 0) {
			increaseLikeByOne(i.childComments, newCommentLikeId);
		}
	}
};


let finalCommentsViewPage = () => {
	fetch("https://randomuser.me/api/")
    .then(response => {
        return response.json();
    })
    .then(data => {
		window.user = data.results[0];
        console.log(data.results);
		let getCommentsFromLocalStorage = JSON.parse(
			localStorage.getItem("comments")
		);
		if (getCommentsFromLocalStorage) {
			let allComments = createRecusiveView(getCommentsFromLocalStorage);
			commentList.innerHTML = allComments;
		}
    });
};

finalCommentsViewPage();


let addNewChildComment = (allComments, newComment) => {
	for (let i of allComments) {
		if (i.commentId === newComment.parentCommentId) {
			i.childComments.push(newComment);
		} else if (i.childComments.length > 0) {
			addNewChildComment(i.childComments, newComment);
		}
	}
};

let getAllComments = () => JSON.parse(localStorage.getItem("comments"));


let setAllComments = allComments =>
	localStorage.setItem("comments", JSON.stringify(allComments));

let updateComment = (allComments, updatedCommentId, updatedCommentText) => {
	for (let i of allComments) {
		if (i.commentId === updatedCommentId) {
			i.commentText = updatedCommentText;
		} else if (i.childComments.length > 0) {
			updateComment(i.childComments, updatedCommentId, updatedCommentText);
		}
	}
};


let deleteComment = (allComments, newCommentId) => {
	for (let i in allComments) {
		if (allComments[i].commentId === newCommentId) {
			allComments.splice(i, 1);
		} else if (allComments[i].childComments.length > 0) {
			deleteComment(allComments[i].childComments, newCommentId);
		}
	}
};

commentList.addEventListener("click", e => {
	if (e.target.innerText === "Reply") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;
		currentParentComment.appendChild(
			createReplyButtonCommentView(parentId, "Add Comment")
		);
		e.target.style.display = "none";
		e.target.nextSibling.style.display = "none";
	} else if (e.target.innerText === "Add Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
	    const newAddedComment = Object.assign(user,{
				parentCommentId: parentId,
				commentId: Math.random()
					.toString()
					.substr(2, 7),
				commentText: e.target.parentNode.firstChild.value,
				childComments: [],
				Likes: 0
		});
		let getCommentsFromLocalStorage = getAllComments();
		addNewChildComment(getCommentsFromLocalStorage, newAddedComment);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Likes") {
		let getCommentsFromLocalStorage = getAllComments();
		increaseLikeByOne(getCommentsFromLocalStorage, e.target.parentNode.id);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Edit") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;

		const complateCommentText = e.target.parentNode.innerText;
		const commentToArray = complateCommentText.split(" ");
		const findIndexOfLikes = commentToArray.indexOf("Likes");
		const realComment = commentToArray.slice(0, findIndexOfLikes);

		currentParentComment.appendChild(
			createReplyButtonCommentView(
				parentId,
				"update Comment",
				realComment.join(" ")
			)
		);
		e.target.style.display = "none";
	} else if (e.target.innerText === "update Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");

		let getCommentsFromLocalStorage = getAllComments();
		updateComment(
			getCommentsFromLocalStorage,
			parentId,
			e.target.parentNode.firstChild.value
		);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Delete") {
		const parentId = e.target.parentNode.getAttribute("id");
		let getCommentsFromLocalStorage = getAllComments();
		deleteComment(getCommentsFromLocalStorage, parentId);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	}
});
