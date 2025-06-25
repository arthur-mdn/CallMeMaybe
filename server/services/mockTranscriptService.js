const mockTranscript = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return "Ceci est une transcription simulée pour tester l'interface. Elle contient plusieurs phrases pour simuler un vrai dialogue. La qualité de l'enregistrement est excellente et la reconnaissance vocale fonctionne parfaitement.";
}

export default mockTranscript;