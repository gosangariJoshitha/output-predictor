fetch("http://localhost:5000/leaderboard")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("tbody");
    data.forEach((user, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${user.name}</td>
          <td>${user.rollNo}</td>
          <td>${user.score}</td>
          <td>${user.timeTaken}s</td>
        </tr>
      `;
    });
  });