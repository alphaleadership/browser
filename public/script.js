document.getElementById('fetchButton').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const response = await window.api.makeRequest(url);
  document.getElementById('responseOutput').innerHTML = JSON.stringify(response, null, 2);
});
