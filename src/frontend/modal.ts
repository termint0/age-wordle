function customConfirm(prompt: string, yesButtonText: string, noButtonText: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Get dialog and buttons by their IDs or classes
    const modal = document.getElementById('modal-prompt') as HTMLElement;
    const promptDiv = document.getElementById('prompt-text') as HTMLDivElement;
    const yesButton = document.getElementById('prompt-yes') as HTMLButtonElement;
    const noButton = document.getElementById('prompt-no') as HTMLButtonElement;

    modal.classList.remove("hidden");
    promptDiv.innerHTML = prompt;
    yesButton.innerText = yesButtonText;
    noButton.innerText = noButtonText;


    // Attach event listeners to resolve the promise
    const handleYes = () => {
      resolve(true);
      cleanup();
    };

    const handleNo = () => {
      resolve(false);
      cleanup();
    };

    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        handleNo();
    }

    // Cleanup function to hide dialog and remove event listeners
    const cleanup = () => {
      modal.classList.add("hidden");
      yesButton.removeEventListener('click', handleYes);
      noButton.removeEventListener('click', handleNo);
      document.removeEventListener('keydown', keydown);
    };

    yesButton.addEventListener('click', handleYes);
    noButton.addEventListener('click', handleNo);
    document.addEventListener('keydown', keydown);
  });
}


function popupInfo(text: string, buttonText: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Get dialog and buttons by their IDs or classes
    const modal = document.getElementById('modal-info') as HTMLElement;
    const infoDiv = document.getElementById('info-text') as HTMLDivElement;
    const button = document.getElementById('info-close') as HTMLButtonElement;

    modal.classList.remove("hidden");
    if (text) {
      infoDiv.innerHTML = text;
    }
    if (buttonText) {
      button.innerText = buttonText;
    }


    // Attach event listeners to resolve the promise
    const close = () => {
      resolve(true);
      cleanup();
    };

    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape")
        close();
    }

    // Cleanup function to hide dialog and remove event listeners
    const cleanup = () => {
      modal.classList.add("hidden");
      button.removeEventListener('click', close);
      document.removeEventListener('keydown', keydown);
    };

    button.addEventListener('click', close);
    document.addEventListener('keydown', keydown);
  });
}
