export default class Utils {
  static async importFromPublic(fileName: string) {
    const response = await fetch(process.env.PUBLIC_URL + fileName)
    return response.text()
  }
}
