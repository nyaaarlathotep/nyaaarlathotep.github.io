<dependency>
<groupId>org.apache.pdfbox</groupId>
<artifactId>pdfbox</artifactId>
<version>2.0.4</version>
</dependency>

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.lang.Nullable;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * 文件格式转换
 *
 * @author yuegenhua
 * @date 2021/10/21
 * @since 1.0.0
 */
public class TransFileUtil {


    private static final int DEFAULT_DPI = 200;
    private static final String PDF_END = ".pdf";

    /**
     * 单张图片的转换
     *
     * @param imgPath
     * @param destFilePath
     */
    public static void createPdfFromImage(String imgPath, String destFilePath) {

        try {
            PDDocument document = new PDDocument();
            File image = new File(imgPath);
            InputStream input = new FileInputStream(image);
            //读取图片
            BufferedImage bufferedImage = ImageIO.read(input);
            float width = bufferedImage.getWidth();
            float height = bufferedImage.getHeight();
            //创建PDF的一页
            PDPage page = new PDPage(new PDRectangle(width, height));
            document.addPage(page);
            PDImageXObject pdImageXObject = PDImageXObject.createFromFileByContent(image, document);
            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            //写入图片
            contentStream.drawImage(pdImageXObject, 0, 0);
            contentStream.close();
            input.close();

            File file1 = new File(destFilePath);

            document.save(file1);
            document.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**
     * 单张pdf的转换
     * type==1为转化为一张图片，type==1为转化为多张图片
     *
     * @param pdfPath
     * @param destFilePath
     */
    public static void createImageFromPdf(String pdfPath, int type, @Nullable String destFilePath) {

        try {
            if (pdfPath == null || "".equals(pdfPath) || !pdfPath.endsWith(PDF_END)) {
                return;
            }

            PDDocument pdDocument = PDDocument.load(new File(pdfPath));
            PDFRenderer renderer = new PDFRenderer(pdDocument);


            switch (type) {
                case 1:
                    destFilePath = (null == destFilePath || "".equals(destFilePath)) ?
                            pdfPath : destFilePath;
                    toPluralPic(pdDocument, renderer, destFilePath);
                    break;
                case 2:
                    destFilePath = (null == destFilePath || "".equals(destFilePath)) ?
                            destFilePath.replace(".pdf", "_" + DEFAULT_DPI + ".jpg") : destFilePath;
                    toOnePic(pdDocument, renderer, destFilePath);
                    break;

                default:
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void toOnePic(PDDocument pdDocument, PDFRenderer renderer, String destFilePath) throws Exception {
        int width = 0;
        int[] singleImgRGB;
        int shiftHeight = 0;
        BufferedImage imageResult = null;
        for (int i = 0, len = pdDocument.getNumberOfPages(); i < len; i++) {
            BufferedImage image = renderer.renderImageWithDPI(0, DEFAULT_DPI, ImageType.RGB);
            int imageHeight = image.getHeight();
            int imageWidth = image.getWidth();
            if (i == 0) {
                // 计算高度和偏移量 使用第一张图片宽度;
                width = imageWidth;
                // 保存每页图片的像素值
                imageResult = new BufferedImage(width, imageHeight * len, BufferedImage.TYPE_INT_RGB);
            } else {
                // 计算偏移高度
                shiftHeight += imageHeight;
            }
            singleImgRGB = image.getRGB(0, 0, width, imageHeight, null, 0, width);
            imageResult.setRGB(0, shiftHeight, width, imageHeight, singleImgRGB, 0, width);
        }
        pdDocument.close();
        File outFile = new File(destFilePath);
        ImageIO.write(imageResult, "jpg", outFile);
    }

    private static void toPluralPic(PDDocument pdDocument, PDFRenderer renderer, String destFilePath) throws Exception {

        for (int i = 0, len = pdDocument.getNumberOfPages(); i < len; i++) {
            BufferedImage image = renderer.renderImageWithDPI(i, DEFAULT_DPI, ImageType.RGB);

            // 保存每页图片的像素值
            File outFile = new File(destFilePath.replace(".pdf", "_" + DEFAULT_DPI + i + ".jpg"));
            ImageIO.write(image, "jpg", outFile);
        }
        pdDocument.close();

    }
}
